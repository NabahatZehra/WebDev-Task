const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!req.session.cart) {
            req.session.cart = {
                items: [],
                totalQty: 0,
                totalPrice: 0
            };
        }

        const cart = req.session.cart;
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].qty += 1;
        } else {
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        cart.totalQty += 1;
        cart.totalPrice += product.price;

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding to cart');
    }
};

exports.getCart = (req, res) => {
    const cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };
    res.render('cart', {
        title: 'Your Cart',
        cart: cart
    });
};

exports.removeFromCart = (req, res) => {
    const { productId } = req.body;
    const cart = req.session.cart;

    if (!cart) return res.redirect('/cart');

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        cart.totalQty -= item.qty;
        cart.totalPrice -= (item.price * item.qty);
        cart.items.splice(itemIndex, 1);
    }

    res.redirect('/cart');
};
