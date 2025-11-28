const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate OTP expiry time (10 minutes from now)
 * @returns {Date} Expiry date
 */
const generateOTPExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Verify if OTP is still valid
 * @param {Date} expiryTime - OTP expiry time
 * @returns {boolean} True if valid, false if expired
 */
const isOTPValid = (expiryTime) => {
    return new Date() < new Date(expiryTime);
};

/**
 * Hash OTP for storage (optional security measure)
 * @param {string} otp - Plain OTP
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = {
    generateOTP,
    generateOTPExpiry,
    isOTPValid,
    hashOTP,
};
