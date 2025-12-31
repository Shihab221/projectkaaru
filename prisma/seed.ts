import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful home decoration items including wall art, vases, and decorative pieces",
    subcategories: ["Wall Art", "Vases", "Figurines", "Planters"],
    image: "/images/categories/home-decor.jpg",
  },
  {
    name: "Key Chains",
    slug: "key-chains",
    description: "Custom keychains with personalization options and various designs",
    subcategories: ["Custom Name", "Character", "Logo", "Minimalist"],
    image: "/images/categories/keychains.jpg",
  },
  {
    name: "Organizer",
    slug: "organizer",
    description: "Functional organizers for desk, cables, storage, and office supplies",
    subcategories: ["Desk Organizer", "Cable Management", "Storage Box", "Pen Holder"],
    image: "/images/categories/organizer.jpg",
  },
  {
    name: "Others",
    slug: "others",
    description: "Various other products including gifts, tech accessories, and more",
    subcategories: ["Gifts", "Tech Accessories", "Office", "Kitchen"],
    image: "/images/categories/others.jpg",
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed categories
    console.log('📁 Seeding categories...');
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⚠️  Category already exists: ${category.name}`);
      }
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminEmail = "admin@projectkaru.com";
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("12345678", 12);
      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('⚠️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@projectkaru.com');
    console.log('   Password: 12345678');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });