const Product = require('../models/Product');
const Notification = require('../models/Notification');

const listProducts = async (req, res) => {
  const { search, category, sort, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (search) {
    const regex = { $regex: search.trim(), $options: 'i' };
    filter.$or = [{ name: regex }, { category: regex }];
  }
  if (category) {
    filter.category = { $regex: category.trim(), $options: 'i' };
  }

  const sortOptions = {};
  if (sort === 'price_asc') sortOptions.price = 1;
  if (sort === 'price_desc') sortOptions.price = -1;

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const createProduct = async (req, res) => {
  const { name, category, price, stock, minStock, image } = req.body;
  if (!name || price == null || stock == null) {
    return res.status(400).json({ message: 'name, price and stock are required' });
  }

  const product = await Product.create({ 
    name, 
    category, 
    price, 
    stock, 
    minStock: minStock || 10, 
    image 
  });

  // Emit new product event
  if (global.io) {
    global.io.emit('product-created', {
      productId: product._id.toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock,
      image: product.image
    });
  }

  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const oldProduct = await Product.findById(id);
  const product = await Product.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  // Check if stock was updated
  const stockUpdated = updates.stock !== undefined;
  const minStockUpdated = updates.minStock !== undefined;
  
  // Determine if low stock alert should be shown
  const isLowStock = product.stock <= product.minStock;
  const wasLowStock = oldProduct && oldProduct.stock <= oldProduct.minStock;
  
  // Emit stock/inventory update event with badge info
  if (global.io) {
    // Get low stock items count for admin badge
    const lowStockItems = await Product.countDocuments({ 
      stock: { $lte: Product.db.model('Product').schema.path('minStock').defaultValue || 10 } 
    });

    // Create notification for admin if transitioning to low stock
    if (isLowStock && !wasLowStock) {
      try {
        await Notification.create({
          recipientId: null, // Broadcast to all admins
          recipientType: 'Admin',
          type: 'low_stock_alert',
          title: 'Low Stock Alert',
          message: `${product.name} is below minimum stock level (${product.stock}/${product.minStock})`,
          productId: product._id,
          read: false
        });
      } catch (err) {
        console.error('Error creating low stock notification:', err);
      }
    }

    global.io.emit('stock-updated', {
      productId: product._id.toString(),
      productName: product.name,
      newStock: product.stock,
      minStock: product.minStock,
      previousStock: oldProduct?.stock,
      isLowStock: isLowStock,
      category: product.category,
      price: product.price,
      badge: lowStockItems // Number of items below min stock
    });
  }
  
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  // Emit product deleted event
  if (global.io) {
    global.io.emit('product-deleted', {
      productId: product._id.toString(),
      productName: product.name
    });
  }

  res.json({ message: 'Product deleted', product });
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
