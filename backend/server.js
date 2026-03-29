const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const { authMiddleware, requireStudent, requireAdmin } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

const Admin = require('./models/Admin');
const { seedProducts } = require('./utils/seedData');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Notifications (student)
const { getNotifications } = require('./utils/notificationHelper');
app.get('/api/notifications', authMiddleware, requireStudent, (req, res) => {
  const list = getNotifications(req.student._id);
  res.json(list);
});

// Serve static frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || 'stationery-admin';
  const password = process.env.ADMIN_PASSWORD || 'secureAdminPass123';

  const existing = await Admin.findOne({ username });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hashed });
    console.log(`✅ Admin seeded: ${username}`);
  }
};

const start = async () => {
  await connectDB();
  await seedAdmin();
  await seedProducts();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();


