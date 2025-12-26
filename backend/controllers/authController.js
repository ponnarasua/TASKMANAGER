const User = require('../models/User');
const { USER_ROLES, HTTP_STATUS } = require('../utils/constants');
const { generateToken, hashPassword, comparePassword } = require('../utils/authHelper');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { sendError, sendNotFound } = require('../utils/responseHelper');

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req , res) => {
    try {
        let { name, email, password , profileImageUrl, adminInviteToken } = req.body;

        // Check if email is from a public domain
        const emailDomain = getOrgDomain(email);
        if (isPublicDomain(emailDomain)) {
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

        const hashedPassword = await hashPassword(password);

        // Strip Cloudinary base URL if present
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
            token: generateToken(user),
        });
    } catch (error) {
        sendError(res, 'Server error', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
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
        const isMatch = await comparePassword(password, user.password);
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
            token: generateToken(user),
        });
    } catch(error){
        sendError(res, 'Server error', 500, error);
    }
};


// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT token)
const getUserProfile = async (req , res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            return sendNotFound(res, 'User');
        }
        res.json(user);
    } catch(error){
        sendError(res, 'Server error', 500, error);
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT token)
const updateUserProfile = async (req , res)=>{
    try{
       const user = await User.findById(req.user.id);
        if(!user){
            return sendNotFound(res, 'User');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            user.password = await hashPassword(req.body.password);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageUrl: updatedUser.profileImageUrl,
            role: updatedUser.role,
            token: generateToken(updatedUser),
        });
    } catch(error){
        sendError(res, 'Server error', 500, error);
    }
};

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile};