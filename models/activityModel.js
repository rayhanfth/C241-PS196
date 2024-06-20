const db = require('../config/db');

const Activity = {
    async create(email_users, extracted_skin_tone, predicted_palette) {
        const connection = await db();
        const [result] = await connection.query(
            'INSERT INTO activities (email_users, extracted_skin_tone, predicted_palette) VALUES (?, ?, ?)',
            [email_users, extracted_skin_tone, JSON.stringify(predicted_palette)]
        );
        return result.insertId;
    },

    async findByEmail(email) {
        const connection = await db();
        const [rows] = await connection.query(
            'SELECT * FROM activities WHERE email_users = ?',
            [email]
        );
        return rows;
    },

    async findBySkinTone(email_users, extracted_skin_tone) {
        const connection = await db();
        const [rows] = await connection.query(
            'SELECT * FROM activities WHERE email_users = ? AND extracted_skin_tone = ?',
            [email_users, extracted_skin_tone]
        );
        return rows;
    },

    async deleteById(id) {
        const connection = await db();
        const [result] = await connection.query(
            'DELETE FROM activities WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
};

module.exports = Activity;
