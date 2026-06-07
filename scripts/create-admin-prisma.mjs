import { PrismaClient } from '../lib/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log("🔄 Connecting to PostgreSQL...");

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@projectkaru.com" }
    });

    const adminPassword = "turtlebeach";
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists — updating password and role...");
      await prisma.user.update({
        where: { email: "admin@projectkaru.com" },
        data: { password: hashedPassword, role: "admin" },
      });
      console.log("✅ Super Admin password updated!");
    } else {

      // Create admin user
      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: "admin@projectkaru.com",
          password: hashedPassword,
          role: "admin",
          isBlocked: false,
        }
      });
      console.log("✅ Super Admin created successfully!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@projectkaru.com");
    console.log("   Password: not to show");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from PostgreSQL");
    process.exit(0);
  }
}

createSuperAdmin();
