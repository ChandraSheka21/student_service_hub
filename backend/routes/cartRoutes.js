const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { authMiddleware, requireStudent } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, requireStudent);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
