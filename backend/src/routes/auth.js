const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, refreshToken, getMe, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'doctor', 'nurse', 'receptionist', 'patient']),
    validateRequest,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validateRequest,
  ],
  login
);

router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
