require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const products = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
    stock: 10,
  },
  {
    name: 'Linen Shirt',
    description: 'Breathable linen shirt for warm weather.',
    price: 1899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    stock: 20,
  },
  {
    name: 'Canvas Tote',
    description: 'Everyday canvas tote with an inner pocket.',
    price: 899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Design Systems Book',
    description: 'A practical guide to building consistent product UI.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Ceramic Pour-Over',
    description: 'Handmade ceramic dripper for slow coffee.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    stock: 6,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(products);
      console.log(`Seeded ${products.length} products`);
    } else {
      console.log('Products already exist, seed skipped');
    }
    await mongoose.disconnect();
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
