import { PrismaClient } from '@prisma/client';

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
  console.log('Start seeding categories...');

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug }
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
