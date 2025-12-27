const { sendError } = require('../utils/responseHelper');
const {
    sendRegistrationOTPService,
    verifyRegistrationOTPService,
    forgotPasswordService,
    resetPasswordService,
    deleteAccountRequestService,
    confirmDeleteAccountService
} = require('../services/otpService');

// @desc Send OTP for registration
// @route POST /api/auth/send-registration-otp
// @access Public
const sendRegistrationOTPHandler = async (req, res) => {
    try {
        const result = await sendRegistrationOTPService(req.body);
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            ...result
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to send OTP. Please try again.', error.status || 500, error);
    }
};

// @desc Verify OTP and complete registration
// @route POST /api/auth/verify-registration-otp
// @access Public
const verifyRegistrationOTPHandler = async (req, res) => {
    try {
        const result = await verifyRegistrationOTPService(req.body);
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: {
                _id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                profileImageUrl: result.user.profileImageUrl,
                role: result.user.role,
                isEmailVerified: result.user.isEmailVerified
            },
            token: result.token
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to verify OTP. Please try again.', error.status || 500, error);
    }
};

// @desc Send OTP for password reset
// @route POST /api/auth/forgot-password
// @access Public
const forgotPasswordHandler = async (req, res) => {
    try {
        const result = await forgotPasswordService(req.body);
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please use it to reset your password.',
            ...result
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to send OTP. Please try again.', error.status || 500, error);
    }
};

// @desc Verify OTP and reset password
// @route POST /api/auth/reset-password
// @access Public
const resetPasswordHandler = async (req, res) => {
    try {
        await resetPasswordService(req.body);
        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to reset password. Please try again.', error.status || 500, error);
    }
};

// @desc Request account deletion
// @route POST /api/auth/delete-account-request
// @access Private
const deleteAccountRequestHandler = async (req, res) => {
    try {
        const result = await deleteAccountRequestService(req.user);
        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to confirm account deletion.',
            ...result
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to send OTP. Please try again.', error.status || 500, error);
    }
};

// @desc Verify OTP and delete account
// @route POST /api/auth/confirm-delete-account
// @access Private
const confirmDeleteAccountHandler = async (req, res) => {
    try {
        await confirmDeleteAccountService(req.user, req.body);
        res.status(200).json({
            success: true,
            message: 'Your account has been permanently deleted.'
        });
    } catch (error) {
        sendError(res, error.message || 'Failed to delete account. Please try again.', error.status || 500, error);
    }
};

module.exports = {
    sendRegistrationOTPHandler,
    verifyRegistrationOTPHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    deleteAccountRequestHandler,
    confirmDeleteAccountHandler,
};
