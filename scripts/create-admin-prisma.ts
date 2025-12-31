import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log("🔄 Connecting to database...");

    const adminEmail = "admin@projectkaru.com";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("   Email: admin@projectkaru.com");

      // Update to admin role if not already
      if (existingAdmin.role !== "admin") {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: "admin" }
        });
        console.log("   Updated role to admin");
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash("12345678", 12);

      // Create admin user
      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        }
      });
      console.log("✅ Super Admin created successfully!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@projectkaru.com");
    console.log("   Password: 12345678");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from database");
  }
}

createSuperAdmin();
