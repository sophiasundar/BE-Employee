// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../Controllers/UserController');

const router = express.Router();

// User Registration
router.post('/register', registerUser);

// User Login
router.post('/login', loginUser);

module.exports = router;