const { HTTP_STATUS } = require('./constants');

// Validate required fields
const validateRequiredFields = (fields, data) => {
    const errors = [];
    
    fields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            errors.push(`${field} is required`);
        }
    });
    
    return errors;
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
};

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    
    const requiredErrors = validateRequiredFields(['name', 'email', 'password'], req.body);
    if (requiredErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Validation failed', 
            errors: requiredErrors 
        });
    }
    
    if (!validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid email format' 
        });
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: passwordError 
        });
    }
    
    next();
};

// Validation middleware for OTP verification
const validateOTPVerification = (req, res, next) => {
    const { email, otp } = req.body;
    
    const requiredErrors = validateRequiredFields(['email', 'otp'], req.body);
    if (requiredErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Validation failed', 
            errors: requiredErrors 
        });
    }
    
    if (!validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid email format' 
        });
    }
    
    if (!/^\d{6}$/.test(otp)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'OTP must be a 6-digit number' 
        });
    }
    
    next();
};

// Validation middleware for forgot password
const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;
    
    if (!email || !email.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Email is required' 
        });
    }
    
    if (!validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid email format' 
        });
    }
    
    next();
};

// Validation middleware for reset password
const validateResetPassword = (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    
    const requiredErrors = validateRequiredFields(['email', 'otp', 'newPassword'], req.body);
    if (requiredErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Validation failed', 
            errors: requiredErrors 
        });
    }
    
    if (!validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid email format' 
        });
    }
    
    if (!/^\d{6}$/.test(otp)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'OTP must be a 6-digit number' 
        });
    }
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: passwordError 
        });
    }
    
    next();
};

// Validation middleware for account deletion OTP
const validateDeleteAccountOTP = (req, res, next) => {
    const { otp } = req.body;
    
    if (!otp || !otp.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'OTP is required' 
        });
    }
    
    if (!/^\d{6}$/.test(otp)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'OTP must be a 6-digit number' 
        });
    }
    
    next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    const requiredErrors = validateRequiredFields(['email', 'password'], req.body);
    if (requiredErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Validation failed', 
            errors: requiredErrors 
        });
    }
    
    if (!validateEmail(email)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid email format' 
        });
    }
    
    next();
};

// Validation middleware for task creation
const validateTaskCreation = (req, res, next) => {
    const { title, description, dueDate, assignedTo } = req.body;
    
    const requiredErrors = validateRequiredFields(['title', 'description', 'dueDate'], req.body);
    if (requiredErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Validation failed', 
            errors: requiredErrors 
        });
    }
    
    if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'At least one user must be assigned to the task' 
        });
    }
    
    // Validate date
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'Invalid due date format' 
        });
    }
    
    next();
};

// Validation middleware for task update
const validateTaskUpdate = (req, res, next) => {
    const { assignedTo, dueDate } = req.body;
    
    if (assignedTo && (!Array.isArray(assignedTo) || assignedTo.length === 0)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            message: 'assignedTo must be a non-empty array' 
        });
    }
    
    if (dueDate) {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
                message: 'Invalid due date format' 
            });
        }
    }
    
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateTaskCreation,
    validateTaskUpdate,
    validateOTPVerification,
    validateForgotPassword,
    validateResetPassword,
    validateDeleteAccountOTP,
    validateRequiredFields,
    validateEmail,
    validatePassword,
};
