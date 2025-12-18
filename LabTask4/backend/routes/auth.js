const express = require('express');
const router = express.Router();
const { isAdmin, requireSuperAdmin } = require('../middlewares/admin');
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');

const isSuperAdmin = requireSuperAdmin({ fallbackPath: '/admin/dashboard' });

// ==================== AUTH (MVC) ====================
router.get('/login', adminAuthController.showLogin);
router.post('/login', adminAuthController.login);

router.get('/register', adminAuthController.showRegister);
router.post('/register', adminAuthController.register);

router.get('/logout', adminAuthController.logout);

// Dev-only helper to create/reset a super admin account
router.get('/dev/ensure-super-admin', adminAuthController.ensureSuperAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard', isAdmin, adminController.getDashboard);

// ==================== PRODUCTS MANAGEMENT (ADMIN UI) ====================
router.get('/products', isAdmin, adminController.getProductsPage);
router.get('/products/add', isAdmin, isSuperAdmin, adminController.getAddProductForm);
router.post('/products/add', isAdmin, isSuperAdmin, adminController.postAddProduct);
router.get('/products/edit/:id', isAdmin, isSuperAdmin, adminController.getEditProductForm);
router.post('/products/edit/:id', isAdmin, isSuperAdmin, adminController.postEditProduct);
router.post('/products/delete/:id', isAdmin, isSuperAdmin, adminController.postDeleteProduct);

// ==================== CATEGORIES OVERVIEW ====================
router.get('/categories', isAdmin, adminController.getCategoriesPage);

// ==================== TESTIMONIALS MANAGEMENT ====================
router.get('/testimonials', isAdmin, adminController.getTestimonialsPage);
router.post('/testimonials/add', isAdmin, isSuperAdmin, adminController.postAddTestimonial);
router.post(
  '/testimonials/delete/:id',
  isAdmin,
  isSuperAdmin,
  adminController.postDeleteTestimonial
);

module.exports = router;