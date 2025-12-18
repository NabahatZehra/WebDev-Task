const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// PUBLIC WEBSITE ROUTES (MVC views)

// List + filters + pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const search = req.query.search;

    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      filter.price = {};
      if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total, categories] = await Promise.all([
      Product.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
      Product.distinct('category'),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.render('products', {
      title: 'Our Services',
      products,
      categories,
      currentPage: page,
      totalPages,
      totalProducts: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: {
        category: category || 'all',
        minPrice: !Number.isNaN(minPrice) ? minPrice : '',
        maxPrice: !Number.isNaN(maxPrice) ? maxPrice : '',
        search: search || '',
        limit,
      },
    });
  } catch (error) {
    console.error('Error loading products page:', error);
    res.status(500).send('Error loading products');
  }
});

// Product detail page
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('product-details', {
      title: product.name,
      product,
    });
  } catch (error) {
    console.error('Error loading product details:', error);
    res.status(500).send('Error loading product');
  }
});

module.exports = router;