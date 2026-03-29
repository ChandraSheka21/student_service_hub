const express = require('express');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  updateStock,
  verifyUpload,
  deleteUpload
} = require('../controllers/adminController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Inventory/Stock
router.get('/inventory', getInventory);
router.put('/inventory/:productId', updateStock);

// Uploads
router.put('/upload/:id/verify', verifyUpload);
router.delete('/upload/:id', deleteUpload);

module.exports = router;
