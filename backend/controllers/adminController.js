const Order = require('../models/Order');
const Product = require('../models/Product');
const Upload = require('../models/Upload');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Helper functions
const createNotification = async (recipientId, recipientType, type, title, message, orderId = null, productId = null) => {
  try {
    const notification = new Notification({
      recipientId,
      recipientType,
      type,
      title,
      message,
      orderId,
      productId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const logAuditTrail = (data) => {
  console.log('[AUDIT LOG]', data);
};

// ===== DASHBOARD STATISTICS =====
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Order placed', 'In queue'] } });
    const reviewedOrders = await Order.countDocuments({ status: 'Reviewed' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const readyToCollect = await Order.countDocuments({ status: { $in: ['Packed successfully', 'Ready to collect', 'Ready to Collect'] } });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Calculate total pending amount
    const pendingRevenueData = await Order.aggregate([
      { $match: { status: { $nin: ['Delivered', 'Cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const pendingRevenue = pendingRevenueData[0]?.total || 0;

    // Get low stock items
    const lowStockItems = await Product.find({ stock: { $lt: 20 } }).select('name stock').limit(5);

    // Get top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', sold: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          productName: '$product.name',
          sold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find({})
      .populate('studentId', 'name rollNo')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber studentId totalPrice status createdAt');

    res.json({
      summary: {
        totalOrders,
        pendingOrders,
        reviewedOrders,
        processingOrders,
        readyToCollect,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        pendingRevenue
      },
      lowStockItems,
      topProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// ===== ORDERS MANAGEMENT =====
const getAllOrders = async (req, res) => {
  try {
    const { status, studentName, studentId, orderId, paymentStatus, sortBy = 'desc' } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (studentId) filter.studentId = studentId;
    if (orderId) filter.orderNumber = { $regex: orderId, $options: 'i' };

    let orders = await Order.find(filter)
      .populate('studentId', 'name rollNo email department mobile')
      .sort({ createdAt: sortBy === 'asc' ? 1 : -1 });

    // Filter by student name if provided
    if (studentName) {
      orders = orders.filter(order =>
        order.studentId?.name?.toLowerCase().includes(studentName.toLowerCase())
      );
    }

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      studentName: order.studentId?.name || 'Unknown',
      studentId: order.studentId?.rollNo || 'N/A',
      studentEmail: order.studentId?.email || 'N/A',
      studentDepartment: order.studentId?.department || 'N/A',
      items: order.items?.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })) || [],
      itemCount: order.items?.length || 0,
      totalQuantity: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      totalAmount: order.totalPrice || 0,
      paymentStatus: order.paymentStatus || 'Pending',
      orderDate: order.createdAt,
      status: order.status || 'Order placed',
      remarks: order.remarks || '',
      statusHistory: order.statusHistory || []
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order detail
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('studentId', 'name rollNo email department mobile uploadCount')
      .populate('items.productId', 'name price stock');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order._id,
      orderNumber: order.orderNumber,
      student: order.studentId,
      items: order.items?.map(item => ({
        productId: item.productId?._id,
        productName: item.productId?.name || item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })) || [],
      totalAmount: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      remarks: order.remarks,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order detail', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, remarks } = req.body;
    const adminId = req.admin?._id || req.user?._id || 'system';

    const validStatuses = ['Order placed', 'In queue', 'Reviewed', 'Processing', 'Packed successfully', 'Ready to collect', 'Ready to Collect', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        remarks: remarks || order.remarks,
        updatedAt: new Date(),
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            changedBy: adminId.toString()
          }
        }
      },
      { new: true }
    ).populate('studentId');

    // Log to audit trail
    logAuditTrail({
      adminId,
      action: 'UPDATE_ORDER_STATUS',
      orderId: orderId,
      newStatus: status,
      timestamp: new Date()
    });

    // Send notification to student based on status
    const notificationMessages = {
      'Reviewed': { title: '✓ Order Reviewed', message: 'Your order has been reviewed by the admin.' },
      'Processing': { title: '⚙ Order Processing', message: 'Your order is being processed.' },
      'Packed successfully': { title: '📦 Order Packed', message: 'Your order has been packed successfully.' },
      'Ready to collect': { title: '🎁 Ready to Collect', message: 'Your order is ready to collect from the counter.' },
      'Ready to Collect': { title: '🎁 Ready to Collect', message: 'Your order is ready to collect from the counter.' },
      'Delivered': { title: '✅ Order Delivered', message: 'Your order has been delivered.' },
      'Cancelled': { title: '❌ Order Cancelled', message: 'Your order has been cancelled.' }
    };

    if (notificationMessages[status]) {
      await createNotification(
        updatedOrder.studentId._id,
        'Student',
        `order_${status.toLowerCase().replace(/\s+/g, '_')}`,
        notificationMessages[status].title,
        notificationMessages[status].message,
        updatedOrder._id
      );
    }

    // Emit order status change event
    if (global.io) {
      // Notify the specific student
      global.io.to(`student-${updatedOrder.studentId._id}`).emit('order-status-updated', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        remarks: updatedOrder.remarks,
        updatedAt: updatedOrder.updatedAt,
        statusHistory: updatedOrder.statusHistory
      });

      // Notify admin dashboard
      global.io.to('admin-room').emit('order-status-changed', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        studentName: updatedOrder.studentId?.name || 'Unknown',
        status: updatedOrder.status,
        totalPrice: updatedOrder.totalPrice,
        updatedAt: updatedOrder.updatedAt
      });
    }

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Update order payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ['Pending', 'Paid', 'Failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus, updatedAt: new Date() },
      { new: true }
    ).populate('studentId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
};

// ===== INVENTORY/STOCK MANAGEMENT =====
const getInventory = async (req, res) => {
  try {
    const { category, sortBy = 'name' } = req.query;

    let filter = {};
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .select('name stock price category image createdAt')
      .sort(sortBy === 'stock' ? { stock: 1 } : { name: 1 });

    const inventory = products.map(product => ({
      id: product._id,
      name: product.name,
      stock: product.stock || 0,
      price: product.price || 0,
      category: product.category || 'General',
      image: product.image || '',
      status: product.stock < 20 ? 'Low Stock' : product.stock === 0 ? 'Out of Stock' : 'In Stock',
      lastUpdated: product.createdAt
    }));

    // Get categories
    const categories = await Product.distinct('category');

    res.json({
      inventory,
      categories,
      stats: {
        totalProducts: inventory.length,
        outOfStock: inventory.filter(item => item.stock === 0).length,
        lowStock: inventory.filter(item => item.stock > 0 && item.stock < 20).length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
};

// Update stock
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, action } = req.body;
    const adminId = req.admin?._id || req.user?._id || 'system';

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let oldStock = product.stock;
    let newStock = oldStock;

    if (action === 'set') {
      newStock = quantity;
    } else if (action === 'add') {
      newStock = oldStock + quantity;
    } else if (action === 'subtract') {
      newStock = Math.max(0, oldStock - quantity);
    } else {
      newStock = quantity;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    );

    // Log audit trail
    logAuditTrail({
      adminId,
      action: 'UPDATE_STOCK',
      productId: productId,
      oldStock,
      newStock,
      timestamp: new Date()
    });

    // Notify admins if stock is low
    if (newStock < 20 && oldStock >= 20) {
      await createNotification(
        '6000000000000000000001', // Placeholder for admin group
        'Admin',
        'low_stock_alert',
        '⚠ Low Stock Alert',
        `${product.name} is now low in stock (${newStock} units remaining)`,
        null,
        product._id
      );
    }

    res.json({
      message: 'Stock updated successfully',
      product: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        oldStock,
        newStock
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

// Get stock analytics
const getStockAnalytics = async (req, res) => {
  try {
    const lowStockItems = await Product.find({ stock: { $lt: 20, $gt: 0 } })
      .select('name stock price')
      .sort({ stock: 1 });

    const outOfStockItems = await Product.find({ stock: 0 })
      .select('name price');

    const totalValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalItems: { $sum: '$stock' }
        }
      }
    ]);

    res.json({
      lowStockItems: lowStockItems.map(item => ({
        name: item.name,
        stock: item.stock,
        price: item.price,
        value: item.stock * item.price
      })),
      outOfStockItems,
      totalInventoryValue: totalValue[0]?.totalValue || 0,
      totalItemsInStock: totalValue[0]?.totalItems || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock analytics', error: error.message });
  }
};

// ===== UPLOADS MANAGEMENT =====
const verifyUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });
    upload.verified = Boolean(verified);
    await upload.save();
    res.json(upload);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying upload', error: error.message });
  }
};

const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await Upload.findByIdAndDelete(id);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });
    res.json({ message: 'Upload deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting upload', error: error.message });
  }
};

// ===== REPORTS =====
const getDailySalesData = async (req, res) => {
  try {
    const { dateRange = 'month' } = req.query;

    // Calculate date range
    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    if (dateRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (dateRange === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (dateRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Aggregate daily sales data
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format dates for display (dd/mm or month day format)
    const formattedData = dailySalesData.map(day => {
      const date = new Date(day._id + 'T00:00:00Z');
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: day.orders,
        revenue: Math.round(day.revenue),
        avgOrderValue: Math.round(day.avgOrderValue)
      };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily sales data', error: error.message });
  }
};

const getTopSellingItems = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Aggregate top selling products
    const topItems = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Calculate total units and market share
    const totalUnits = topItems.reduce((sum, item) => sum + item.unitsSold, 0);
    
    const formattedItems = topItems.map(item => ({
      productId: item._id,
      name: item.name,
      unitsSold: item.unitsSold,
      revenue: Math.round(item.totalRevenue),
      marketShare: totalUnits > 0 ? ((item.unitsSold / totalUnits) * 100).toFixed(1) : 0,
      avgPrice: Math.round(item.avgPrice)
    }));

    res.json({
      items: formattedItems,
      totalUnits: totalUnits,
      totalRevenue: Math.round(topItems.reduce((sum, item) => sum + item.totalRevenue, 0))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top selling items', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  updatePaymentStatus,
  getInventory,
  updateStock,
  getStockAnalytics,
  getDailySalesData,
  getTopSellingItems,
  verifyUpload,
  deleteUpload
};
