const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validation.middleware');
const { isGuest, isAuthenticated } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/register', isGuest, authController.getRegister);

router.post(
  '/register',
  isGuest,
  [
    body('name').trim().isLength({ min:2, max:100 }).withMessage('Имя должно содержать от 2 до 100 символов.'),
    body('email').trim().isEmail().withMessage('Введите корректный email.').normalizeEmail(),
    body('password').isLength({ min:6 }).withMessage('Пароль должен содержать минимум 6 символов.'),
    body('confirmPassword').notEmpty().withMessage('Подтвердите пароль.')
  ],
  validate,
  asyncHandler(authController.postRegister)
);

router.get('/login', isGuest, authController.getLogin);

router.post(
  '/login',
  isGuest,
  [
    body('email').trim().isEmail().withMessage('Введите корректный email.').normalizeEmail(),
    body('password').notEmpty().withMessage('Введите пароль.')
  ],
  validate,
  asyncHandler(authController.postLogin)
);

router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;