const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['registration', 'password-reset', 'account-deletion'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will automatically delete expired documents
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    userData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster lookups
OTPSchema.index({ email: 1, type: 1, verified: 1 });
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); // Auto-delete after 10 minutes

// Method to check if OTP is still valid
OTPSchema.methods.isValid = function() {
    return this.expiresAt > new Date() && this.attempts < this.maxAttempts && !this.verified;
};

// Method to increment attempts
OTPSchema.methods.incrementAttempts = function() {
    this.attempts += 1;
    return this.save();
};

module.exports = mongoose.model('OTP', OTPSchema);
