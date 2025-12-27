// OTP Service Layer
const User = require('../models/User');
const OTP = require('../models/OTP');
const { USER_ROLES, HTTP_STATUS } = require('../utils/constants');
const { generateOTP, generateOTPExpiry } = require('../utils/otpUtils');
const { sendRegistrationOTP, sendPasswordResetOTP, sendAccountDeletionOTP } = require('../utils/emailService');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { hashPassword, generateToken } = require('../utils/authHelper');

const sendRegistrationOTPService = async ({ name, email, password, profileImageUrl, adminInviteToken }) => {
    const emailDomain = getOrgDomain(email);
    if (isPublicDomain(emailDomain)) {
        const err = new Error('Registration is only allowed for private organization email addresses. Public email domains (Gmail, Yahoo, Outlook, etc.) are not permitted.');
        err.status = 403;
        throw err;
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        const err = new Error('User already exists with this email');
        err.status = 400;
        throw err;
    }
    let role = USER_ROLES.MEMBER;
    if (adminInviteToken) {
        if (adminInviteToken.trim() !== process.env.ADMIN_INVITE_TOKEN) {
            const err = new Error('Invalid admin invite token. Please enter the correct token to register as admin.');
            err.status = 401;
            throw err;
        }
        role = USER_ROLES.ADMIN;
    }
    await OTP.deleteMany({ email, type: 'registration' });
    const otp = generateOTP();
    const expiresAt = generateOTPExpiry();
    const hashedPassword = await hashPassword(password);
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
    await sendRegistrationOTP(email, otp, name);
    return { email };
};

const verifyRegistrationOTPService = async ({ email, otp }) => {
    const otpRecord = await OTP.findOne({ email, type: 'registration', verified: false }).sort({ createdAt: -1 });
    if (!otpRecord) {
        const err = new Error('No OTP found. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (!otpRecord.isValid()) {
        const err = new Error('OTP has expired or maximum attempts reached. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (otpRecord.otp !== otp) {
        await otpRecord.incrementAttempts();
        const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
        const err = new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
        err.status = 400;
        throw err;
    }
    otpRecord.verified = true;
    await otpRecord.save();
    const user = await User.create({ ...otpRecord.userData, isEmailVerified: true });
    await OTP.deleteMany({ email, type: 'registration' });
    const token = generateToken(user);
    return { user, token };
};

const forgotPasswordService = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('No account found with this email address');
        err.status = 404;
        throw err;
    }
    await OTP.deleteMany({ email, type: 'password-reset' });
    const otp = generateOTP();
    const expiresAt = generateOTPExpiry();
    await OTP.create({ email, otp, type: 'password-reset', expiresAt });
    await sendPasswordResetOTP(email, otp, user.name);
    return { email };
};

const resetPasswordService = async ({ email, otp, newPassword }) => {
    const otpRecord = await OTP.findOne({ email, type: 'password-reset', verified: false }).sort({ createdAt: -1 });
    if (!otpRecord) {
        const err = new Error('No OTP found. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (!otpRecord.isValid()) {
        const err = new Error('OTP has expired or maximum attempts reached. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (otpRecord.otp !== otp) {
        await otpRecord.incrementAttempts();
        const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
        const err = new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
        err.status = 400;
        throw err;
    }
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('User');
        err.status = 404;
        throw err;
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    await OTP.deleteMany({ email, type: 'password-reset' });
    return {};
};

const deleteAccountRequestService = async (user) => {
    const foundUser = await User.findById(user._id);
    if (!foundUser) {
        const err = new Error('User');
        err.status = 404;
        throw err;
    }
    await OTP.deleteMany({ email: foundUser.email, type: 'account-deletion' });
    const otp = generateOTP();
    const expiresAt = generateOTPExpiry();
    await OTP.create({ email: foundUser.email, otp, type: 'account-deletion', expiresAt });
    await sendAccountDeletionOTP(foundUser.email, otp, foundUser.name);
    return { email: foundUser.email };
};

const confirmDeleteAccountService = async (user, { otp }) => {
    const foundUser = await User.findById(user._id);
    if (!foundUser) {
        const err = new Error('User');
        err.status = 404;
        throw err;
    }
    const otpRecord = await OTP.findOne({ email: foundUser.email, type: 'account-deletion', verified: false }).sort({ createdAt: -1 });
    if (!otpRecord) {
        const err = new Error('No OTP found. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (!otpRecord.isValid()) {
        const err = new Error('OTP has expired or maximum attempts reached. Please request a new OTP.');
        err.status = 400;
        throw err;
    }
    if (otpRecord.otp !== otp) {
        await otpRecord.incrementAttempts();
        const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
        const err = new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
        err.status = 400;
        throw err;
    }
    await require('../models/Task').deleteMany({ $or: [{ createdBy: foundUser._id }, { assignedTo: foundUser._id }] });
    await OTP.deleteMany({ email: foundUser.email });
    await User.findByIdAndDelete(foundUser._id);
    return {};
};

module.exports = {
    sendRegistrationOTPService,
    verifyRegistrationOTPService,
    forgotPasswordService,
    resetPasswordService,
    deleteAccountRequestService,
    confirmDeleteAccountService,
};