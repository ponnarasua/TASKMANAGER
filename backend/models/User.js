const mongoose = require('mongoose');
const { USER_ROLES } = require('../utils/constants');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.MEMBER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ['active', 'pending-deletion', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
}
);

// Indexes for better query performance
// Note: email index is already created by 'unique: true' in the schema
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1, role: 1 });

module.exports  = mongoose.model('User', UserSchema);
