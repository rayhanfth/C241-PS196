const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const resetPasswordRoutes = require('./routes/resetPasswordRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const cronJobs = require('./config/cronJobs');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/reset-password', resetPasswordRoutes);

module.exports = app;
