const User = require('../models/User');
const OTP = require('../models/OTP');
const { USER_ROLES, HTTP_STATUS } = require('../utils/constants');
const { generateOTP, generateOTPExpiry } = require('../utils/otpUtils');
const { sendRegistrationOTP, sendPasswordResetOTP, sendAccountDeletionOTP } = require('../utils/emailService');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { hashPassword, generateToken } = require('../utils/authHelper');
const { sendError, sendNotFound, sendBadRequest, sendForbidden } = require('../utils/responseHelper');

// @desc Send OTP for registration
// @route POST /api/auth/send-registration-otp
// @access Public
const sendRegistrationOTPHandler = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Check if email is from a public domain
        const emailDomain = getOrgDomain(email);
        if (isPublicDomain(emailDomain)) {
            return sendForbidden(res, 'Registration is only allowed for private organization email addresses. Public email domains (Gmail, Yahoo, Outlook, etc.) are not permitted.');
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendBadRequest(res, 'User already exists with this email');
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

        // Delete any existing OTPs for this email and type
        await OTP.deleteMany({ email, type: 'registration' });

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = generateOTPExpiry();

        // Hash password for storage
        const hashedPassword = await hashPassword(password);

        // Store OTP with user data
        await OTP.create({
            email,
            otp,
            type: 'registration',
            expiresAt,
            userData: {
                name,
                email,
                password: hashedPassword,
                profileImageUrl: profileImageUrl?.replace(/^https:\/\/res\.cloudinary\.com\/dqhu7vgbc\/image\/upload\//, ''),
                role
            }
        });

        // Send OTP email
        await sendRegistrationOTP(email, otp, name);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            email
        });

    } catch (error) {
        console.error('Error in sendRegistrationOTP:', error);
        sendError(res, 'Failed to send OTP. Please try again.', 500, error);
    }
};

// @desc Verify OTP and complete registration
// @route POST /api/auth/verify-registration-otp
// @access Public
const verifyRegistrationOTPHandler = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find OTP record
        const otpRecord = await OTP.findOne({ 
            email, 
            type: 'registration',
            verified: false 
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return sendBadRequest(res, 'No OTP found. Please request a new OTP.');
        }

        // Check if OTP is valid
        if (!otpRecord.isValid()) {
            return sendBadRequest(res, 'OTP has expired or maximum attempts reached. Please request a new OTP.');
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            await otpRecord.incrementAttempts();
            const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
            return sendBadRequest(res, `Invalid OTP. ${remainingAttempts} attempts remaining.`);
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Create user
        const user = await User.create({
            ...otpRecord.userData,
            isEmailVerified: true
        });

        // Delete OTP record
        await OTP.deleteMany({ email, type: 'registration' });

        // Generate token
        const token = generateToken(user);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Registration successful!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            },
            token
        });

    } catch (error) {
        console.error('Error in verifyRegistrationOTP:', error);
        sendError(res, 'Failed to verify OTP. Please try again.', 500, error);
    }
};

// @desc Send OTP for password reset
// @route POST /api/auth/forgot-password
// @access Public
const forgotPasswordHandler = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return sendNotFound(res, 'No account found with this email address');
        }

        // Delete any existing OTPs for this email and type
        await OTP.deleteMany({ email, type: 'password-reset' });

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = generateOTPExpiry();

        // Store OTP
        await OTP.create({
            email,
            otp,
            type: 'password-reset',
            expiresAt
        });

        // Send OTP email
        await sendPasswordResetOTP(email, otp, user.name);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'OTP sent to your email. Please use it to reset your password.',
            email
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        sendError(res, 'Failed to send OTP. Please try again.', 500, error);
    }
};

// @desc Verify OTP and reset password
// @route POST /api/auth/reset-password
// @access Public
const resetPasswordHandler = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find OTP record
        const otpRecord = await OTP.findOne({ 
            email, 
            type: 'password-reset',
            verified: false 
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return sendBadRequest(res, 'No OTP found. Please request a new OTP.');
        }

        // Check if OTP is valid
        if (!otpRecord.isValid()) {
            return sendBadRequest(res, 'OTP has expired or maximum attempts reached. Please request a new OTP.');
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            await otpRecord.incrementAttempts();
            const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
            return sendBadRequest(res, `Invalid OTP. ${remainingAttempts} attempts remaining.`);
        }

        // Find user and update password
        const user = await User.findOne({ email });
        if (!user) {
            return sendNotFound(res, 'User');
        }

        // Hash new password
        user.password = await hashPassword(newPassword);
        await user.save();

        // Mark OTP as verified and delete
        await OTP.deleteMany({ email, type: 'password-reset' });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        sendError(res, 'Failed to reset password. Please try again.', 500, error);
    }
};

// @desc Request account deletion
// @route POST /api/auth/delete-account-request
// @access Private
const deleteAccountRequestHandler = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendNotFound(res, 'User');
        }

        // Delete any existing OTPs for this email and type
        await OTP.deleteMany({ email: user.email, type: 'account-deletion' });

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = generateOTPExpiry();

        // Store OTP
        await OTP.create({
            email: user.email,
            otp,
            type: 'account-deletion',
            expiresAt
        });

        // Send OTP email
        await sendAccountDeletionOTP(user.email, otp, user.name);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'OTP sent to your email. Please verify to confirm account deletion.',
            email: user.email
        });

    } catch (error) {
        console.error('Error in deleteAccountRequest:', error);
        sendError(res, 'Failed to send OTP. Please try again.', 500, error);
    }
};

// @desc Verify OTP and delete account
// @route POST /api/auth/confirm-delete-account
// @access Private
const confirmDeleteAccountHandler = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendNotFound(res, 'User');
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({ 
            email: user.email, 
            type: 'account-deletion',
            verified: false 
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return sendBadRequest(res, 'No OTP found. Please request a new OTP.');
        }

        // Check if OTP is valid
        if (!otpRecord.isValid()) {
            return sendBadRequest(res, 'OTP has expired or maximum attempts reached. Please request a new OTP.');
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            await otpRecord.incrementAttempts();
            const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
            return sendBadRequest(res, `Invalid OTP. ${remainingAttempts} attempts remaining.`);
        }

        // Delete user's tasks
        const Task = require('../models/Task');
        await Task.deleteMany({ $or: [{ createdBy: user._id }, { assignedTo: user._id }] });

        // Delete OTP records
        await OTP.deleteMany({ email: user.email });

        // Delete user
        await User.findByIdAndDelete(user._id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Your account has been permanently deleted.'
        });

    } catch (error) {
        console.error('Error in confirmDeleteAccount:', error);
        sendError(res, 'Failed to delete account. Please try again.', 500, error);
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
