const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  const testimonials = [
    {
      name: "Muhammad Hussain",
      stars: "⭐⭐⭐⭐⭐",
      review: "The sound quality is unreal...",
      image: "/images/images.png" // make sure this exists in /public/images/
    },
    {
      name: "Ali Raza",
      stars: "⭐⭐⭐⭐",
      review: "I recorded my latest track here...",
      image: "/images/images.png"
    },
    {
      name: "Sara Ahmed",
      stars: "⭐⭐⭐⭐⭐",
      review: "These studio monitors helped me...",
      image: "/images/images.png"
    },
    {
      name: "Hassan Ali",
      stars: "⭐⭐⭐",
      review: "Speakers sound good overall...",
      image: "/images/images.png"
    }
  ];

  res.render('index', { testimonials });
});

module.exports = router;
