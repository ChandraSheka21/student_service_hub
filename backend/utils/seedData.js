const Product = require('../models/Product');

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const samples = [
    { name: 'A4 Single Line Notebook', category: 'Notebooks', price: 25, stock: 90, minStock: 20 },
    { name: 'Ball Point Pen (Blue)', category: 'Pens', price: 8, stock: 190, minStock: 50 },
    { name: 'Mechanical Pencil', category: 'Pencils', price: 35, stock: 120, minStock: 30 },
    { name: 'Graph Paper Pad', category: 'Graph Books', price: 60, stock: 70, minStock: 20 },
    { name: 'Plastic Geometry Box', category: 'Boxes', price: 130, stock: 55, minStock: 15 },
    { name: 'File Folders (Pack)', category: 'Files', price: 120, stock: 80, minStock: 20 },
    { name: 'Physics Lab Manual', category: 'Lab Manuals', price: 180, stock: 40, minStock: 10 },
    { name: 'Drawing Sheets (Set)', category: 'Drawing Sheets', price: 95, stock: 65, minStock: 15 },
  ];

  await Product.insertMany(samples);
  console.log('✅ Seeded initial products with minimum stock levels');
};

module.exports = { seedProducts };
