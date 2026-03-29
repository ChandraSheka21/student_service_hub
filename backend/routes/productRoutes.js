const express = require('express');
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', authMiddleware, requireAdmin, createProduct);
router.put('/:id', authMiddleware, requireAdmin, updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

module.exports = router;
