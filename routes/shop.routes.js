const express = require('express');
const shopController = require('../controllers/shop.controller');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();
router.get('/', shopController.getHome);
router.get('/catalog', asyncHandler(shopController.getCatalog));
router.get('/products/:id', asyncHandler(shopController.getProductById));
module.exports = router;
