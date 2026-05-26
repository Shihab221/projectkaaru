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

    const adminPassword = "turtlebeach";
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists — updating password and role...");
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          role: "admin",
        },
      });
      console.log("✅ Super Admin password updated!");
    } else {

      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        },
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
    console.log("\n🔌 Disconnected from database");
  }
}

createSuperAdmin();
