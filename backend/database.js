const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'stationery.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            roll_number TEXT PRIMARY KEY
        )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT NOT NULL,
            status TEXT NOT NULL,
            estimated_pickup_time DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (roll_number) REFERENCES users (roll_number)
        )`);

        // Order Items Table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price_at_purchase REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Insert initial sample products if empty
        db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)");
                stmt.run("Blue Pen", 10.0, 100);
                stmt.run("Notebook A4", 50.0, 50);
                stmt.run("Pencil", 5.0, 200);
                stmt.run("Eraser", 5.0, 150);
                stmt.run("Geometry Box", 120.0, 30);
                stmt.finalize();
                console.log("Sample products inserted.");
            }
        });
    });
}

module.exports = db;
