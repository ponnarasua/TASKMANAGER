const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req , res) => {
    try {
        let { name, email, password , profileImageUrl, adminInviteToken } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(401).json({ message: 'User already exists' });
        }

        let role = 'member';
        if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
            role = 'admin';
        }

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

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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