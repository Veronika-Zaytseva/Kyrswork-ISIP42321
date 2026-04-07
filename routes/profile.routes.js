const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profile.controller');
const validate = require('../middlewares/validation.middleware');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();
router.get('/', isAuthenticated, asyncHandler(profileController.getProfile));
router.post('/update', isAuthenticated, [body('name').trim().isLength({ min:2, max:100 }).withMessage('Имя должно содержать от 2 до 100 символов.')], validate, asyncHandler(profileController.updateProfile));
router.post('/change-password', isAuthenticated, [
  body('currentPassword').notEmpty().withMessage('Введите текущий пароль.'),
  body('newPassword').isLength({ min:6 }).withMessage('Новый пароль должен содержать минимум 6 символов.'),
  body('confirmPassword').notEmpty().withMessage('Подтвердите новый пароль.')
], validate, asyncHandler(profileController.changePassword));
module.exports = router;
