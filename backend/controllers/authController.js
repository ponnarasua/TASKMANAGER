const User = require('../models/User');
const { USER_ROLES, HTTP_STATUS } = require('../utils/constants');
const { generateToken, hashPassword, comparePassword } = require('../utils/authHelper');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { sendError, sendNotFound } = require('../utils/responseHelper');

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const { validateRequiredFields, validateEmail, validatePassword, validateName } = require('../utils/validation');
const { registerUserService } = require('../services/authService');
const registerUser = async (req , res) => {
    try {
        // Input validation
        let { name, email, password } = req.body;
        const requiredErrors = validateRequiredFields(['name', 'email', 'password'], req.body);
        if (requiredErrors.length > 0) {
            return sendError(res, requiredErrors.join(', '), HTTP_STATUS.BAD_REQUEST);
        }
        const nameError = validateName(name);
        if (nameError) {
            return sendError(res, nameError, HTTP_STATUS.BAD_REQUEST);
        }
        if (!validateEmail(email)) {
            return sendError(res, 'Invalid email format', HTTP_STATUS.BAD_REQUEST);
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
            return sendError(res, passwordError, HTTP_STATUS.BAD_REQUEST);
        }
        // Service call
        const user = await registerUserService(req.body);
        res.status(HTTP_STATUS.CREATED).json(user);
    } catch (error) {
        if (error.message && error.message.includes('Registration is only allowed')) {
            return sendError(res, error.message, HTTP_STATUS.FORBIDDEN);
        }
        if (error.message && error.message.includes('already exists')) {
            return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
        }
        if (error.message && error.message.includes('admin invite token')) {
            return sendError(res, error.message, HTTP_STATUS.UNAUTHORIZED);
        }
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