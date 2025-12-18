const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/berecords';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['Recording', 'Mixing', 'Mastering', 'Production', 'Equipment', 'Services']
  },
  image: { type: String, required: true },
  description: { type: String, required: true },
  stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  stars: { type: String, default: '⭐⭐⭐⭐⭐' },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Sample Products Data - Using Existing Images
const sampleProducts = [
  // Recording Services
  {
    name: 'Professional Studio Recording',
    price: 150,
    category: 'Recording',
    image: '/images/home_records_gallery1-300x300.jpg',
    description: 'Full-day professional studio recording session with experienced sound engineer',
    stock: 10,
    featured: true
  },
  {
    name: 'Vocal Recording Session',
    price: 100,
    category: 'Recording',
    image: '/images/home_records_gallery2-300x300.jpg',
    description: 'Professional vocal recording with Auto-Tune and effects',
    stock: 15,
    featured: false
  },
  {
    name: 'Podcast Recording & Editing',
    price: 90,
    category: 'Recording',
    image: '/images/home_records_gallery4-300x300.jpg',
    description: 'Professional podcast recording and post-production',
    stock: 20,
    featured: false
  },
  {
    name: 'Live Session Recording',
    price: 220,
    category: 'Recording',
    image: '/images/home_records_gallery5-300x300.jpg',
    description: 'Record your live band performance in studio quality',
    stock: 7,
    featured: false
  },

  // Mixing Services
  {
    name: 'Mixing & Mastering Package',
    price: 250,
    category: 'Mixing',
    image: '/images/home_records_gallery3-300x300.jpg',
    description: 'Complete mixing and mastering service for your tracks',
    stock: 20,
    featured: true
  },
  {
    name: 'Mix Engineering',
    price: 180,
    category: 'Mixing',
    image: '/images/home_records_gallery3-300x300.jpg',
    description: 'Expert mixing engineering for multi-track projects',
    stock: 12,
    featured: true
  },
  {
    name: 'Remote Mixing Service',
    price: 140,
    category: 'Mixing',
    image: '/images/home_records_gallery2-300x300.jpg',
    description: 'Send us your tracks and get professional mixing remotely',
    stock: 50,
    featured: true
  },

  // Mastering Services
  {
    name: 'Audio Mastering',
    price: 120,
    category: 'Mastering',
    image: '/images/home_records_gallery1-300x300.jpg',
    description: 'Professional mastering to make your track radio-ready',
    stock: 30,
    featured: false
  },
  {
    name: 'Stem Mastering Package',
    price: 180,
    category: 'Mastering',
    image: '/images/home_records_gallery6-300x300.jpg',
    description: 'Advanced stem mastering for complex projects',
    stock: 15,
    featured: true
  },

  // Production Services
  {
    name: 'Beat Production',
    price: 200,
    category: 'Production',
    image: '/images/home_records_gallery4-300x300.jpg',
    description: 'Custom beat production for your next hit',
    stock: 25,
    featured: true
  },
  {
    name: 'Sound Design Services',
    price: 300,
    category: 'Production',
    image: '/images/home_records_gallery2-300x300.jpg',
    description: 'Custom sound design for films, games, and media',
    stock: 8,
    featured: false
  },
  {
    name: 'Album Production Package',
    price: 1500,
    category: 'Production',
    image: '/images/home_records_gallery5-300x300.jpg',
    description: 'Complete album production from recording to mastering',
    stock: 3,
    featured: true
  },

  // Equipment Rental
  {
    name: 'Equipment Rental - Microphone',
    price: 50,
    category: 'Equipment',
    image: '/images/home_records_gallery6-300x300.jpg',
    description: 'High-quality studio microphone rental per day',
    stock: 5,
    featured: false
  },
  {
    name: 'Equipment Rental - Interface',
    price: 40,
    category: 'Equipment',
    image: '/images/home_records_gallery4-300x300.jpg',
    description: 'Professional audio interface rental per day',
    stock: 6,
    featured: false
  },

  // Services
  {
    name: 'Audio Restoration',
    price: 80,
    category: 'Services',
    image: '/images/home_records_gallery1-300x300.jpg',
    description: 'Restore and clean up old or damaged audio recordings',
    stock: 15,
    featured: false
  },
  {
    name: 'Consultation Session',
    price: 60,
    category: 'Services',
    image: '/images/home_records_gallery2-300x300.jpg',
    description: 'One-hour consultation with our audio experts',
    stock: 100,
    featured: false
  }
];

// Sample Testimonials Data
const sampleTestimonials = [
  {
    name: "Muhammad Hussain",
    stars: "⭐⭐⭐⭐⭐",
    review: "The sound quality is unreal! BeRecords transformed my music completely.",
    image: "/images/images.png"
  },
  {
    name: "Ali Raza",
    stars: "⭐⭐⭐⭐",
    review: "I recorded my latest track here and the engineers were amazing. Highly recommend!",
    image: "/images/images.png"
  },
  {
    name: "Sara Ahmed",
    stars: "⭐⭐⭐⭐⭐",
    review: "These studio monitors helped me perfect my mix. Professional setup and great service.",
    image: "/images/images.png"
  },
  {
    name: "Hassan Ali",
    stars: "⭐⭐⭐",
    review: "Speakers sound good overall, decent experience for the price.",
    image: "/images/images.png"
  }
];

// Seed Function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Testimonial.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert Products
    console.log('📦 Inserting products...');
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully inserted ${insertedProducts.length} products\n`);

    // Insert Testimonials
    console.log('💬 Inserting testimonials...');
    const insertedTestimonials = await Testimonial.insertMany(sampleTestimonials);
    console.log(`✅ Successfully inserted ${insertedTestimonials.length} testimonials\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Products: ${insertedProducts.length}`);
    console.log(`💬 Testimonials: ${insertedTestimonials.length}`);
    console.log('═══════════════════════════════════════\n');

    // Display products summary
    console.log('📋 Products Summary by Category:');
    const categoryCounts = {};
    insertedProducts.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });
    
    const categoryIcons = {
      'Recording': '🎤',
      'Mixing': '🎚️',
      'Mastering': '🎧',
      'Production': '🎹',
      'Equipment': '🎸',
      'Services': '⚙️'
    };
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${categoryIcons[category]} ${category}: ${count} items`);
    });
    
    console.log(`\n🌟 Featured Products: ${insertedProducts.filter(p => p.featured).length}`);
    console.log(`💰 Price Range: $${Math.min(...insertedProducts.map(p => p.price))} - $${Math.max(...insertedProducts.map(p => p.price))}`);
    
    // Show image distribution
    console.log('\n🖼️  Image Distribution:');
    const imageUsage = {};
    insertedProducts.forEach(product => {
      const imageName = product.image.split('/').pop();
      imageUsage[imageName] = (imageUsage[imageName] || 0) + 1;
    });
    
    Object.entries(imageUsage).forEach(([image, count]) => {
      console.log(`   ${image}: ${count} products`);
    });
    
    console.log('\n✨ You can now start your server and view the data!');
    console.log('   Run: node server.js');
    console.log('   Visit: http://localhost:3000/products\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();