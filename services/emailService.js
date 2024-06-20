const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huetifulproject@gmail.com',
        pass: 'oenv rbpk extr jhbf'
    }

});

const sendRegistrationEmail = async (to, name, verificationToken) => {
    const mailOptions = {
        from: 'huetifulproject@gmail.com',
        to: to,
        subject: 'Email Verification',
        html: `
            <p>Hello ${name},</p>
            <p>Please finish your registration by clicking <a href="http://35.219.99.255:5000/api/auth/verify-email/${verificationToken}">this link</a> to verify your email.</p>
            <p>Thank you for joining us!</p>
            <p>Best regards,<br>HueTiful</p>
        `
    };

    try {
        console.log(`Sending email to ${to}`);
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

const sendResetPasswordEmail = async (to, name, resetToken) => {
    const mailOptions = {
        from: 'huetifulproject@gmail.com',
        to: to,
        subject: 'Password Reset Request',
        html: `
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Please use <a href="http://35.219.99.255:5000/api/reset-password/verify-reset-token/${resetToken}">this link</a> to reset your password.</p>
            <p>If you doesn't requested any password reset, please ignore this email.<p>
            <p>Thank you!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

const sendNewPasswordEmail = async (to, newPassword) => {
    const mailOptions = {
        from: 'huetifulproject@gmail.com',
        to: to,
        subject: 'Your New Password',
        html: `
            <p>Your password has been reset successfully. Your new password is: <strong>${newPassword}</strong></p>
            <p>Please log in and change this password as soon as possible.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }
};

module.exports = { sendRegistrationEmail, sendResetPasswordEmail, sendNewPasswordEmail };
