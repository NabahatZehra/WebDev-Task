const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const applyDiscount = require('../middlewares/applyDiscount');

router.get('/preview', orderController.previewOrder);
router.post('/apply-discount', applyDiscount, (req, res) => {
    req.session.save(err => {
        if (err) console.error('Session save error:', err);
        res.redirect('/order/preview');
    });
});
router.post('/confirm', orderController.confirmOrder);

// Order History Routes
router.get('/my-orders', orderController.renderMyOrdersPage);
router.post('/my-orders', orderController.findMyOrders);

module.exports = router;
