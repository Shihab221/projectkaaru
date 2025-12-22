import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/projectkaru";

// User schema (simplified for script)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: "user" },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "Bangladesh" },
  },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

async function createSuperAdmin() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.models.User || mongoose.model("User", userSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@projectkaru.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("   Email: admin@projectkaru.com");
      
      // Update to admin role if not already
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("   Updated role to admin");
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("12345678", salt);

      // Create admin user
      const admin = new User({
        name: "Super Admin",
        email: "admin@projectkaru.com",
        password: hashedPassword,
        role: "admin",
        isBlocked: false,
      });

      await admin.save();
      console.log("✅ Super Admin created successfully!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@projectkaru.com");
    console.log("   Password: 12345678");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

createSuperAdmin();




















