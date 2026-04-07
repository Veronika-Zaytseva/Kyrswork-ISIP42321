const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const validate = require('../middlewares/validation.middleware');
const { isAdmin } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../config/multer');
const router = express.Router();
const productValidation = [
  body('name').trim().isLength({ min:2, max:150 }).withMessage('Название товара должно содержать от 2 до 150 символов.'),
  body('description').trim().isLength({ min:10 }).withMessage('Описание должно содержать минимум 10 символов.'),
  body('category').trim().notEmpty().withMessage('Укажите категорию.'),
  body('gender').isIn(['male','female','unisex']).withMessage('Некорректное значение типа товара.'),
  body('price').isFloat({ min:0 }).withMessage('Цена должна быть положительным числом.')
];
router.get('/', isAdmin, asyncHandler(adminController.getDashboard));
router.get('/products/new', isAdmin, adminController.getCreateProduct);
router.post('/products', isAdmin, upload.single('image'), productValidation, validate, asyncHandler(adminController.postCreateProduct));
router.get('/products/:id/edit', isAdmin, asyncHandler(adminController.getEditProduct));
router.post('/products/:id', isAdmin, upload.single('image'), productValidation, validate, asyncHandler(adminController.postUpdateProduct));
router.post('/products/:id/delete', isAdmin, asyncHandler(adminController.deleteProduct));
router.get('/orders', isAdmin, asyncHandler(adminController.getOrders));
router.get('/users', isAdmin, asyncHandler(adminController.getUsers));
module.exports = router;
