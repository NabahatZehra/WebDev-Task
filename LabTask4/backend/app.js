require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Import models
const Testimonial = require('./models/Testimonial');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'berecords-admin-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// ==================== VIEW ENGINE ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/berecords';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ==================== ADMIN & AUTH ROUTES (MUST COME FIRST) ====================
// These must be registered BEFORE the product routes to avoid conflicts
app.use('/admin', authRoutes);

// ==================== MAIN WEBSITE ROUTES ====================
app.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.render('index', { title: 'Home', testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.render('index', { title: 'Home', testimonials: [] });
  }
});

app.get('/clients', (req, res) => {
  res.render('clients', { title: 'Our Clients' });
});

app.get('/studio', (req, res) => {
  res.render('studio', { title: 'Studio' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

app.get('/offer', (req, res) => {
  res.render('offer', { title: 'Our Offers' });
});

app.get('/gear', (req, res) => {
  res.render('gear', { title: 'Our Gear' });
});

// ==================== API ROUTES ====================
const Product = require('./models/Product');

app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const search = req.query.search;

    const filter = {};
    
    if (category && category !== 'all') filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 });
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ featured: true });
    const totalTestimonials = await Testimonial.countDocuments();
    
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalProducts,
      featuredProducts,
      totalTestimonials,
      categories: categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCT ROUTES (MUST COME AFTER ADMIN ROUTES) ====================
// Public products/services pages rendered with EJS (MVC)
app.use('/products', productRoutes);

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #0f1111;
            color: white;
          }
          h1 { color: #f1b350; font-size: 72px; margin: 0; }
          p { font-size: 24px; }
          a { color: #f1b350; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>404</h1>
        <p>Page Not Found</p>
        <a href="/">← Back to Home</a>
      </body>
    </html>
  `);
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send(`
    <html>
      <head>
        <title>500 - Server Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #0f1111;
            color: white;
          }
          h1 { color: #f1b350; font-size: 72px; margin: 0; }
          p { font-size: 24px; }
          a { color: #f1b350; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>500</h1>
        <p>Internal Server Error</p>
        <a href="/">← Back to Home</a>
      </body>
    </html>
  `);
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('🎵 BeRecords Server Started');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📦 Products: http://localhost:${PORT}/products`);
  console.log(`🔐 Admin Dashboard: http://localhost:${PORT}/admin/dashboard`);
  console.log(`👤 Admin Login: http://localhost:${PORT}/admin/login`);
  console.log(`📝 Admin Register: http://localhost:${PORT}/admin/register`);
});