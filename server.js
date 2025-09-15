const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'girish',
  database: process.env.DB_NAME || 'storepulse'
};

let db;
async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('📊 Database connected successfully');
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      address TEXT(400) NOT NULL,
      role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      address TEXT(400) NOT NULL,
      owner_id INT,
      average_rating DECIMAL(2,1) DEFAULT 0,
      total_ratings INT DEFAULT 0,
      image_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_store (user_id, store_id)
    )`
  ];
  for (const sql of tables) {
    try {
      await db.execute(sql);
    } catch (error) {
      console.error('❌ Error creating table:', error.message);
    }
  }
  await createDefaultAdmin();
  console.log('✅ Database tables ready');
}

async function createDefaultAdmin() {
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await db.execute(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        ['System Administrator', 'admin@storepulse.com', hashedPassword, '123 Admin Street, Admin City', 'admin']
      );
      console.log('👤 Default admin created: admin@storepulse.com / Admin123!');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/stores');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', req.user);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const validateRegistration = [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be between 20-60 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
  body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
];

const validateStore = [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
];

app.get('/api/debug/user/:email', async (req, res) => {
  try {
    const normalizedEmail = req.params.email.trim().toLowerCase();
    const [users] = await db.execute('SELECT id, email, role, created_at FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    res.json({ userExists: users.length > 0, user: users[0] || null });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ message: 'Debug failed' });
  }
});

app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password, address } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Registration attempt for email:', normalizedEmail);
    const [existing] = await db.execute('SELECT id, email FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    console.log('Existing users:', existing);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated password hash:', hashedPassword);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, normalizedEmail, hashedPassword, address, 'user']
    );
    res.status(201).json({ status: 'success', message: 'User registered', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Login attempt for:', normalizedEmail);  // Debug log
    const [users] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (users.length === 0) return res.status(401).json({ message: 'User not found' });
    const user = users[0];
    console.log('Found user:', user.id, 'Role:', user.role);  // Debug log
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword, 'Stored hash:', user.password);  // Debug log
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    console.log('Generated token for role:', user.role);  // Debug log
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.put('/api/auth/update-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Invalid new password format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) return res.status(401).json({ message: 'Current password incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
});

app.put('/api/user/update-profile', authenticateToken, [
  body('name').optional().isLength({ min: 20, max: 60 }),
  body('address').optional().isLength({ max: 400 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, address } = req.body;
    const userId = req.user.userId;

    await db.execute('UPDATE users SET name = COALESCE(?, name), address = COALESCE(?, address) WHERE id = ?', [name, address, userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
});

app.post('/api/admin/add-user', authenticateToken, validateRegistration, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    if (!['admin', 'user', 'store_owner'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const [existing] = await db.execute('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, normalizedEmail, hashedPassword, address, role]
    );
    res.status(201).json({ message: 'User added', userId: result.insertId });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Add user failed' });
  }
});

app.post('/api/admin/add-store', authenticateToken, upload.single('image'), validateStore, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, address, owner_id } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const image_url = req.file ? `/stores/${req.file.filename}` : null;

    const [result] = await db.execute(
      'INSERT INTO stores (name, email, address, owner_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, normalizedEmail, address, owner_id || null, image_url]
    );
    res.status(201).json({ message: 'Store added', storeId: result.insertId });
  } catch (error) {
    console.error('Add store error:', error);
    res.status(500).json({ message: 'Add store failed' });
  }
});

app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [storeCount] = await db.execute('SELECT COUNT(*) as totalStores FROM stores');
    const [ratingCount] = await db.execute('SELECT COUNT(*) as totalRatings FROM ratings');
    res.json({
      totalUsers: userCount[0].totalUsers,
      totalStores: storeCount[0].totalStores,
      totalRatings: ratingCount[0].totalRatings
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Dashboard fetch failed' });
  }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const { name, email, address, role, sortBy = 'name', sortDir = 'ASC' } = req.query;
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];
    if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
    if (role) { query += ' AND role = ?'; params.push(role); }
    query += ` ORDER BY ${sortBy} ${sortDir}`;
    const [users] = await db.execute(query, params);
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Fetch users failed' });
  }
});

app.get('/api/admin/stores', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const { name, email, address, sortBy = 'name', sortDir = 'ASC' } = req.query;
    let query = 'SELECT id, name, email, address, average_rating as rating FROM stores WHERE 1=1';
    const params = [];
    if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
    query += ` ORDER BY ${sortBy} ${sortDir}`;
    const [stores] = await db.execute(query, params);
    res.json({ stores });
  } catch (error) {
    console.error('Fetch stores error:', error);
    res.status(500).json({ message: 'Fetch stores failed' });
  }
});

app.get('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const [users] = await db.execute('SELECT name, email, address, role FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    if (user.role === 'store_owner') {
      const [store] = await db.execute('SELECT average_rating FROM stores WHERE owner_id = ?', [req.params.id]);
      user.rating = store.length ? store[0].average_rating : null;
    }
    res.json({ user });
  } catch (error) {
    console.error('Fetch user details error:', error);
    res.status(500).json({ message: 'Fetch user details failed' });
  }
});

app.get('/api/stores', authenticateToken, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortDir = 'ASC' } = req.query;
    let query = 'SELECT id, name, address, average_rating, total_ratings, image_url FROM stores WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (name LIKE ? OR address LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ` ORDER BY ${sortBy} ${sortDir}`;
    const [stores] = await db.execute(query, params);

    const userId = req.user.userId;
    for (let store of stores) {
      const [rating] = await db.execute('SELECT rating FROM ratings WHERE store_id = ? AND user_id = ?', [store.id, userId]);
      store.user_rating = rating.length ? rating[0].rating : null;
    }
    res.json({ stores });
  } catch (error) {
    console.error('Fetch stores error:', error);
    res.status(500).json({ message: 'Fetch stores failed' });
  }
});

app.get('/api/stores/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, address, average_rating, total_ratings, image_url FROM stores WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Store not found' });
    res.json({ store: rows[0] });
  } catch (error) {
    console.error('Fetch store error:', error);
    res.status(500).json({ message: 'Fetch store failed' });
  }
});

app.get('/api/stores/:id/my-rating', authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.userId;
    const [rows] = await db.execute(
      'SELECT rating FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );
    res.json({ myRating: rows.length ? rows[0].rating : null });
  } catch (error) {
    console.error('Fetch rating error:', error);
    res.status(500).json({ message: 'Fetch rating failed' });
  }
});

app.post('/api/stores/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = Number(req.params.id);
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    await db.execute(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, rating]
    );

    const [agg] = await db.execute('SELECT AVG(rating) AS avg, COUNT(*) AS cnt FROM ratings WHERE store_id = ?', [storeId]);
    const avg = Number(agg[0].avg || 0).toFixed(1);
    const cnt = Number(agg[0].cnt || 0);

    await db.execute('UPDATE stores SET average_rating = ?, total_ratings = ? WHERE id = ?', [avg, cnt, storeId]);
    res.json({ message: 'Rating saved', average_rating: avg, total_ratings: cnt });
  } catch (error) {
    console.error('Rate error:', error);
    res.status(500).json({ message: 'Rating failed' });
  }
});

app.get('/api/owner/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'store_owner') return res.status(403).json({ message: 'Store owner access required' });
    const ownerId = req.user.userId;
    const [stores] = await db.execute('SELECT id, average_rating FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) return res.status(404).json({ message: 'No store found' });
    const storeId = stores[0].id;
    const [raters] = await db.execute(
      'SELECT u.name, u.email, r.rating FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?',
      [storeId]
    );
    res.json({ averageRating: stores[0].average_rating, raters });
  } catch (error) {
    console.error('Dashboard fetch error:', error.stack || error.message || error);
    res.status(500).json({ message: 'Failed to fetch owner dashboard data', error: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [users] = await db.execute('SELECT name, email, address, role FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Profile fetch failed' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
startServer();
