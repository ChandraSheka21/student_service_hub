const Product = require('../models/Product');

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const samples = [
    { name: 'A4 Single Line Notebook', category: 'Notebooks', price: 25, stock: 90 },
    { name: 'Ball Point Pen (Blue)', category: 'Pens', price: 8, stock: 190 },
    { name: 'Mechanical Pencil', category: 'Pencils', price: 35, stock: 120 },
    { name: 'Graph Paper Pad', category: 'Graph Books', price: 60, stock: 70 },
    { name: 'Plastic Geometry Box', category: 'Boxes', price: 130, stock: 55 },
    { name: 'File Folders (Pack)', category: 'Files', price: 120, stock: 80 },
    { name: 'Physics Lab Manual', category: 'Lab Manuals', price: 180, stock: 40 },
    { name: 'Drawing Sheets (Set)', category: 'Drawing Sheets', price: 95, stock: 65 },
  ];

  await Product.insertMany(samples);
  console.log('✅ Seeded initial products');
};

module.exports = { seedProducts };
