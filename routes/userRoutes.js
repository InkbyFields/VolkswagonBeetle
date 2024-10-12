const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Input validation function
const validateInput = (username, password) => {
    const errors = [];
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long.');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }
    return errors;
};

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        const errors = validateInput(username, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Create a new user
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        const errors = validateInput(username, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Authentication failed');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Hash the new password before saving
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.send('Password reset successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

module.exports = { router, authenticate };

