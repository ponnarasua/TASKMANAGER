// Auth Service Layer
const User = require('../models/User');
const { USER_ROLES, HTTP_STATUS } = require('../utils/constants');
const { generateToken, hashPassword, comparePassword } = require('../utils/authHelper');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');

const registerUserService = async (body) => {
    let { name, email, password , profileImageUrl, adminInviteToken } = body;
    const emailDomain = getOrgDomain(email);
    if (isPublicDomain(emailDomain)) {
        throw new Error('Registration is only allowed for private organization email addresses. Public email domains (Gmail, Yahoo, Outlook, etc.) are not permitted.');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }
    let role = USER_ROLES.MEMBER;
    if (adminInviteToken) {
        if (adminInviteToken.trim() !== process.env.ADMIN_INVITE_TOKEN) {
            throw new Error('Invalid admin invite token. Please enter the correct token to register as admin.');
        }
        role = USER_ROLES.ADMIN;
    }
    const hashedPassword = await hashPassword(password);
    profileImageUrl = profileImageUrl?.replace(/^https:\/\/res\.cloudinary\.com\/dqhu7vgbc\/image\/upload\//, '');
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
        role
    });
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        token: generateToken(user),
    };
};

module.exports = { registerUserService };