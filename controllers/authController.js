const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { sendRegistrationEmail } = require('../services/emailService');

// Email validation function
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }
    if (!re.test(String(email).toLowerCase())) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true, error: null };
};

// Register endpoint
const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    // Validate name
    if (!name) {
        console.log('Error: Name is required');
        return res.status(400).json({
            status: 'error',
            message: 'Name is required'
        });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        console.log(`Error: ${emailValidation.error} - Provided email: ${email}`);
        return res.status(400).json({
            status: 'error',
            message: emailValidation.error
        });
    }

    // Validate password
    if (!password || password.length < 8) {
        console.log('Error: Password must be at least 8 characters');
        return res.status(400).json({
            status: 'error',
            message: 'Password must be at least 8 characters'
        });
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = jwt.sign({ email }, 'verificationSecret', { expiresIn: '1h' });

        // Create user with verificationToken
        const userId = await User.create(name, email, hashedPassword, verificationToken);

        // Send registration email with verificationToken
        await sendRegistrationEmail(email, name, verificationToken);

        res.status(201).json({
            status: 'success',
            message: 'Anda berhasil register'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: 'error',
            message: 'Server Error'
        });
    }
};

// Login endpoint
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if user's email is verified
        if (!user.is_verified) {
            return res.status(403).json({
                status: 'error',
                message: 'Email is not verified'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id }, 'test123', { expiresIn: '7d' });

        res.status(200).json({
            status: 'success',
            message: 'Anda berhasil login',
            token: token
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: 'error',
            message: 'Server Error'
        });
    }
};

// Verify email endpoint
const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        // Find user by verification token
        const user = await User.findByVerificationToken(token);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid verification token'
            });
        }

        // Update user verification status
        await User.updateVerificationStatus(user.id);

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: 'error',
            message: 'Server Error'
        });
    }
};

module.exports = { register, login, verifyEmail };
