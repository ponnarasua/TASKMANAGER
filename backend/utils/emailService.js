const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send OTP email for registration
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 */
const sendRegistrationOTP = async (email, otp, name = 'User') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Task Manager',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Task Manager!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Thank you for registering with Task Manager. To complete your registration, please use the following OTP:</p>
                        
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        
                        <p><strong>This OTP is valid for 10 minutes.</strong></p>
                        <p>If you didn't request this registration, please ignore this email.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Registration OTP sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending registration OTP:', error);
        throw new Error('Failed to send OTP email');
    }
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 */
const sendPasswordResetOTP = async (email, otp, name = 'User') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - Task Manager',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>We received a request to reset your password. Use the following OTP to proceed:</p>
                        
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        
                        <p><strong>This OTP is valid for 10 minutes.</strong></p>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset OTP sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        throw new Error('Failed to send OTP email');
    }
};

/**
 * Send OTP email for account deletion
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 */
const sendAccountDeletionOTP = async (email, otp, name = 'User') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Account Deletion Verification - Task Manager',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #fc4a1a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #fc4a1a; letter-spacing: 5px; }
                    .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 15px 0; color: #721c24; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Account Deletion Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>We received a request to delete your account. To confirm this action, please use the following OTP:</p>
                        
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        
                        <p><strong>This OTP is valid for 10 minutes.</strong></p>
                        
                        <div class="danger">
                            <strong>⚠️ Warning:</strong> This action is permanent and cannot be undone. All your data will be permanently deleted.
                        </div>
                        
                        <p>If you didn't request account deletion, please secure your account immediately and change your password.</p>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Account deletion OTP sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending account deletion OTP:', error);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    sendRegistrationOTP,
    sendPasswordResetOTP,
    sendAccountDeletionOTP,
};
