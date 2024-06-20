const crypto = require('crypto');
const db = require('../config/db');

const User = {
    // Create Account
    async create(name, email, password, verificationToken) {
        const connection = await db();
        const [result] = await connection.query(
            'INSERT INTO users (name, email, password, verification_token, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, password, verificationToken]
        );
        return result.insertId;
    },

    // Check existing Email
    async findByEmail(email) {
        const connection = await db();
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Delete User (Invalid Email)
    async deleteById(id) {
        const connection = await db();
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
    },

    // Verif Email
    async findByVerificationToken(verificationToken) {
        const connection = await db();
        const [rows] = await connection.query('SELECT * FROM users WHERE verification_token = ?', [verificationToken]);
        return rows[0];
    },

    // Update Database (is_verified)
    async updateVerificationStatus(userId) {
        const connection = await db();
        await connection.query('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = ?', [userId]);
    },

    // Update user password
    async updatePassword(userId, password) {
        const connection = await db();
        await connection.query('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
    },

    // Clear reset token
    async clearResetToken(userId) {
        const connection = await db();
        await connection.query('UPDATE users SET reset_token = NULL WHERE id = ?', [userId]);
    },

    // Save reset token
    async saveResetToken(userId, resetToken) {
        const connection = await db();
        await connection.query('UPDATE users SET reset_token = ? WHERE id = ?', [resetToken, userId]);
    },

    // Find id for activities table
    async findById(id) {
        const connection = await db();
        const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Find unverified users
    async findUnverifiedUsers() {
        const connection = await db();
        const [rows] = await connection.query('SELECT * FROM users WHERE is_verified = false');
        return rows;
    }
};

module.exports = User;
