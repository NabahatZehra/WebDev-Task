const Order = require('../models/Order');

exports.previewOrder = (req, res) => {
    const cart = req.session.cart;

    if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
    }

    // Calculate generic total (will be updated by discount middleware later)
    const subtotal = cart.totalPrice;
    const discount = req.session.discount || 0;
    const total = subtotal - (subtotal * discount / 100);

    res.render('order-preview', {
        title: 'Order Preview',
        cart: cart,
        subtotal: subtotal,
        discountPercent: discount,
        discountAmount: (subtotal * discount / 100),
        finalTotal: total,
        user: req.user // Assuming we might have user data later
    });
};

exports.confirmOrder = async (req, res) => {
    try {
        const cart = req.session.cart;
        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart');
        }

        const { customerName, customerEmail, customerAddress, customerPhone } = req.body;

        // Recalculate totals to be safe
        const subtotal = cart.totalPrice;
        const discountPercent = req.session.discount || 0;
        const discountAmount = (subtotal * discountPercent / 100);
        const finalTotal = subtotal - discountAmount;

        const newOrder = new Order({
            customer: {
                name: customerName,
                email: customerEmail,
                address: customerAddress,
                phone: customerPhone
            },
            items: cart.items.map(item => ({
                product: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.qty
            })),
            subtotal: subtotal,
            discount: discountAmount,
            total: finalTotal,
            status: 'Placed'
        });

        await newOrder.save();

        // Clear cart and discount
        req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
        req.session.discount = 0;

        // Redirect to success page or show success message
        res.render('order-success', {
            title: 'Order Confirmed',
            order: newOrder
        });

    } catch (error) {
        console.error('Order confirmation error:', error);
        res.status(500).send('Error processing order: ' + error.message);
    }
};

exports.renderMyOrdersPage = (req, res) => {
    res.render('my-orders', {
        title: 'My Orders',
        error: null
    });
};

exports.findMyOrders = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.render('my-orders', {
                title: 'My Orders',
                error: 'Please enter an email address'
            });
        }

        const orders = await Order.find({ 'customer.email': email }).sort({ createdAt: -1 });

        res.render('order-list', {
            title: 'Your Order History',
            orders: orders,
            email: email
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('my-orders', {
            title: 'My Orders',
            error: 'An error occurred while fetching your orders'
        });
    }
};

