const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const validate = require('../middlewares/validation.middleware');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();
router.get('/', isAuthenticated, asyncHandler(cartController.getCart));
router.post('/add', isAuthenticated, [
  body('productId').isInt({ min:1 }).withMessage('Некорректный товар.'),
  body('productSizeId').isInt({ min:1 }).withMessage('Выберите размер товара.'),
  body('quantity').isInt({ min:1 }).withMessage('Количество должно быть не меньше 1.')
], validate, asyncHandler(cartController.addToCart));
router.post('/:id/update', isAuthenticated, [body('quantity').isInt({ min:0 }).withMessage('Количество должно быть 0 или больше.')], validate, asyncHandler(cartController.updateCartItem));
router.post('/:id/delete', isAuthenticated, asyncHandler(cartController.removeCartItem));
module.exports = router;
