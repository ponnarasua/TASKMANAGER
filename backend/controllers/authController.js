const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { USER_ROLES, TOKEN_EXPIRY, HTTP_STATUS, PUBLIC_DOMAINS } = require('../utils/constants');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
};

// Helper function to get domain from email
const getEmailDomain = (email) => {
    return email.split('@')[1]?.toLowerCase();
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req , res) => {
    try {
        let { name, email, password , profileImageUrl, adminInviteToken } = req.body;

        // Check if email is from a public domain
        const emailDomain = getEmailDomain(email);
        if (PUBLIC_DOMAINS.includes(emailDomain)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                message: 'Registration is only allowed for private organization email addresses. Public email domains (Gmail, Yahoo, Outlook, etc.) are not permitted.' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User already exists' });
        }

        // Validate admin invite token
        // If token is provided but wrong, reject the request
        // If token is empty/not provided, proceed as member
        let role = USER_ROLES.MEMBER;
        
        if (adminInviteToken) {
            // Token provided - must be correct
            if (adminInviteToken.trim() !== process.env.ADMIN_INVITE_TOKEN) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                    message: 'Invalid admin invite token. Please enter the correct token to register as admin.',
                    field: 'adminInviteToken'
                });
            }
            // Token is correct
            role = USER_ROLES.ADMIN;
        }
        // If no token provided, role remains as MEMBER

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        profileImageUrl = profileImageUrl?.replace(/^https:\/\/res\.cloudinary\.com\/dqhu7vgbc\/image\/upload\//, '');

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        });

        res.status(HTTP_STATUS.CREATED).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message });
    }
};


// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req , res)=>{
    try{
       const {email, password} = req.body;

       const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: 'Wrong password'});
        }

        // Return user data with JWT
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};


// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT token)
const getUserProfile = async (req , res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT token)
const updateUserProfile = async (req , res)=>{
    try{
       const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;


        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }

};

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile};