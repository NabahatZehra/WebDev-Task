const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');

// Helpers for flash messages using session
const consumeFlash = (req) => {
  const success = req.session.successMessage || null;
  const error = req.session.errorMessage || null;
  req.session.successMessage = null;
  req.session.errorMessage = null;
  return { success, error };
};

const isSuperAdminSession = (req) => req.session && req.session.adminRole === 'super-admin';

// ========== DASHBOARD ==========
exports.getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ featured: true });
    const totalTestimonials = await Testimonial.countDocuments();

    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      username: req.session.adminUsername,
      isSuperAdmin: isSuperAdminSession(req),
      stats: {
        totalProducts,
        featuredProducts,
        totalTestimonials,
        categories: categoryStats,
      },
      recentProducts,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
};

// ========== PRODUCTS ==========
exports.getProductsPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const { success, error } = consumeFlash(req);

    res.render('admin/products', {
      title: 'Manage Products',
      username: req.session.adminUsername,
      isSuperAdmin: isSuperAdminSession(req),
      products,
      currentPage: page,
      totalPages,
      success,
      error,
    });
  } catch (err) {
    console.error('Admin products page error:', err);
    res.status(500).send('Error loading products');
  }
};

exports.getAddProductForm = (req, res) => {
  const { error } = consumeFlash(req);

  res.render('admin/product-form', {
    title: 'Add Product',
    username: req.session.adminUsername,
    isSuperAdmin: isSuperAdminSession(req),
    product: null,
    error,
  });
};

exports.postAddProduct = async (req, res) => {
  try {
    const { name, price, category, stock, image, description, featured } =
      req.body;

    if (!name || !price || !category || !image || !description) {
      req.session.errorMessage = 'All required fields must be filled.';
      return res.redirect('/admin/products/add');
    }

    const product = new Product({
      name,
      price,
      category,
      image,
      description,
      stock: stock ? Number(stock) : 0,
      featured: !!featured,
    });

    await product.save();
    req.session.successMessage = 'Product created successfully.';
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create product error:', error);
    req.session.errorMessage = 'Error creating product.';
    res.redirect('/admin/products/add');
  }
};

exports.getEditProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.session.errorMessage = 'Product not found.';
      return res.redirect('/admin/products');
    }

    const { error } = consumeFlash(req);

    res.render('admin/product-form', {
      title: 'Edit Product',
      username: req.session.adminUsername,
      isSuperAdmin: isSuperAdminSession(req),
      product,
      error,
    });
  } catch (error) {
    console.error('Edit product form error:', error);
    req.session.errorMessage = 'Error loading product.';
    res.redirect('/admin/products');
  }
};

exports.postEditProduct = async (req, res) => {
  try {
    const { name, price, category, stock, image, description, featured } =
      req.body;

    const update = {
      name,
      price,
      category,
      image,
      description,
      stock: stock ? Number(stock) : 0,
      featured: !!featured,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      req.session.errorMessage = 'Product not found.';
      return res.redirect('/admin/products');
    }

    req.session.successMessage = 'Product updated successfully.';
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Update product error:', error);
    req.session.errorMessage = 'Error updating product.';
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
};

exports.postDeleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      req.session.errorMessage = 'Product not found.';
    } else {
      req.session.successMessage = 'Product deleted successfully.';
    }
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.session.errorMessage = 'Error deleting product.';
    res.redirect('/admin/products');
  }
};

// ========== CATEGORIES ==========
exports.getCategoriesPage = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const { success, error } = consumeFlash(req);

    res.render('admin/categories', {
      title: 'Manage Categories',
      username: req.session.adminUsername,
      isSuperAdmin: isSuperAdminSession(req),
      categories,
      success,
      error,
    });
  } catch (error) {
    console.error('Categories page error:', error);
    res.status(500).send('Error loading categories');
  }
};

// ========== TESTIMONIALS ==========
exports.getTestimonialsPage = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    const { success, error } = consumeFlash(req);

    res.render('admin/testimonials', {
      title: 'Manage Testimonials',
      username: req.session.adminUsername,
      isSuperAdmin: isSuperAdminSession(req),
      testimonials,
      success,
      error,
    });
  } catch (error) {
    console.error('Testimonials page error:', error);
    res.status(500).send('Error loading testimonials');
  }
};

exports.postAddTestimonial = async (req, res) => {
  try {
    const { name, image, stars, review } = req.body;

    if (!name || !image || !review) {
      req.session.errorMessage = 'Name, image, and review are required.';
      return res.redirect('/admin/testimonials');
    }

    const testimonial = new Testimonial({
      name,
      image,
      stars: stars || '★★★★★',
      review,
    });

    await testimonial.save();
    req.session.successMessage = 'Testimonial added successfully.';
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error('Add testimonial error:', error);
    req.session.errorMessage = 'Error adding testimonial.';
    res.redirect('/admin/testimonials');
  }
};

exports.postDeleteTestimonial = async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) {
      req.session.errorMessage = 'Testimonial not found.';
    } else {
      req.session.successMessage = 'Testimonial deleted successfully.';
    }
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error('Delete testimonial error:', error);
    req.session.errorMessage = 'Error deleting testimonial.';
    res.redirect('/admin/testimonials');
  }
};


