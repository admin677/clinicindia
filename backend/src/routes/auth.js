import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

// Register User
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['patient', 'doctor', 'admin']),
  body('phone').isMobilePhone('en-IN').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user exists
    const existingUser = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const userId = uuidv4();

    // Create user
    const user = await db.one(
      'INSERT INTO users (id, email, password, first_name, last_name, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, email, role, first_name, last_name',
      [userId, email, hashedPassword, firstName, lastName, role, phone]
    );

    // Create token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login User
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.oneOrNone('SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE id = $1', [req.user.id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Refresh Token
router.post('/refresh', verifyToken, (req, res) => {
  try {
    const token = generateToken(req.user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
