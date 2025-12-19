module.exports = (req, res, next) => {
    const { couponCode } = req.body;
    console.log('Applying Discount - Code Received:', couponCode);

    // Reset discount first to avoid sticking discounts
    req.session.discount = 0;

    if (couponCode && couponCode.toUpperCase() === 'SAVE10') {
        req.session.discount = 10; // 10%
        console.log('Discount Applied: 10%');
    } else {
        console.log('Invalid Coupon Code');
    }

    next();
};
