const mongoose = require('mongoose');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = require('./models/Product.js').default;

    const products = await Product.find({}).limit(5).populate('category', 'name slug').lean();
    console.log('Sample products:');
    products.forEach(p => {
      console.log(`Name: ${p.name}`);
      console.log(`Category: ${p.category?.name} (${p.category?.slug})`);
      console.log(`BackgroundColors: ${JSON.stringify(p.backgroundColors)}`);
      console.log(`BorderColors: ${JSON.stringify(p.borderColors)}`);
      console.log(`Sizes: ${JSON.stringify(p.sizes)}`);
      console.log('---');
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    mongoose.disconnect();
  }
}

checkProducts();

