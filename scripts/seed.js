const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/projectkaaru";

// Category Schema
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
  subcategories: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  shortDescription: String,
  price: Number,
  discountedPrice: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory: String,
  images: [String],
  stock: Number,
  colors: [String],
  isTopProduct: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reviews: [],
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Sample data
const categories = [
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful 3D printed pieces for your home",
    subcategories: ["Wall Art", "Vases", "Figurines", "Planters"],
  },
  {
    name: "Key Chains",
    slug: "key-chains",
    description: "Custom and colorful keychains",
    subcategories: ["Custom Name", "Character", "Logo", "Minimalist"],
  },
  {
    name: "Organizer",
    slug: "organizer",
    description: "Keep your space neat and organized",
    subcategories: ["Desk Organizer", "Cable Management", "Storage Box", "Pen Holder"],
  },
  {
    name: "Others",
    slug: "others",
    description: "Unique 3D printed items",
    subcategories: ["Gifts", "Tech Accessories", "Office", "Kitchen"],
  },
];

// Bcrypt hash for "admin123" - pre-computed
const adminPasswordHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.A.gM1l9lBqQlYC";

const adminUser = {
  name: "Admin",
  email: "admin@projectkaaru.com",
  password: adminPasswordHash,
  role: "admin",
};

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Category.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // Seed categories
    console.log("📁 Seeding categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed admin user
    console.log("👤 Creating admin user...");
    await User.create(adminUser);
    console.log("✅ Admin user created (admin@projectkaaru.com / admin123)");

    // Seed sample products
    console.log("📦 Seeding sample products...");
    const sampleProducts = [
      {
        name: "Modern Geometric Vase",
        slug: "modern-geometric-vase",
        description: "A stunning geometric vase perfect for modern home decor. Made with high-quality PLA plastic.",
        shortDescription: "Stunning geometric vase for modern homes",
        price: 1200,
        discountedPrice: 999,
        category: createdCategories[0]._id,
        subcategory: "Vases",
        images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500"],
        stock: 15,
        isTopProduct: true,
      },
      {
        name: "Custom Name Keychain",
        slug: "custom-name-keychain",
        description: "Personalized keychain with your name. Available in multiple colors.",
        shortDescription: "Personalized keychain with your name",
        price: 250,
        category: createdCategories[1]._id,
        subcategory: "Custom Name",
        images: ["https://images.unsplash.com/photo-1622556498246-755f44ca76f3?w=500"],
        stock: 50,
        colors: ["Red", "Blue", "Green", "Yellow", "Black", "White"],
        isTopProduct: true,
      },
      {
        name: "Desktop Organizer Pro",
        slug: "desktop-organizer-pro",
        description: "Keep your desk clean and organized with this multi-compartment organizer.",
        shortDescription: "Multi-compartment desk organizer",
        price: 800,
        discountedPrice: 650,
        category: createdCategories[2]._id,
        subcategory: "Desk Organizer",
        images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500"],
        stock: 20,
        isTopProduct: true,
      },
      {
        name: "Minimalist Pen Holder",
        slug: "minimalist-pen-holder",
        description: "Simple and elegant pen holder for your workspace.",
        shortDescription: "Simple elegant pen holder",
        price: 350,
        category: createdCategories[2]._id,
        subcategory: "Pen Holder",
        images: ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500"],
        stock: 30,
      },
      {
        name: "Abstract Wall Art",
        slug: "abstract-wall-art",
        description: "Beautiful 3D printed abstract wall art to enhance your living space.",
        shortDescription: "3D printed abstract wall decoration",
        price: 1500,
        discountedPrice: 1199,
        category: createdCategories[0]._id,
        subcategory: "Wall Art",
        images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500"],
        stock: 10,
        isTopProduct: true,
      },
      {
        name: "Character Keychain Collection",
        slug: "character-keychain-collection",
        description: "Fun character keychains perfect for gifts.",
        shortDescription: "Fun character keychains",
        price: 300,
        category: createdCategories[1]._id,
        subcategory: "Character",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"],
        stock: 40,
        colors: ["Red", "Blue", "Pink", "Purple"],
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${sampleProducts.length} sample products`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Admin Login:");
    console.log("   Email: admin@projectkaaru.com");
    console.log("   Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();

