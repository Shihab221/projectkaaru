import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...\n');

    // Get all categories
    const categories = await prisma.category.findMany();
    console.log('📁 Categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug}, id: ${cat.id})`);
    });
    console.log('');

    // Get all products with category info
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    console.log('📦 Products:');
    if (products.length === 0) {
      console.log('  No products found!');
    } else {
      products.forEach(product => {
        console.log(`  - ${product.name}`);
        console.log(`    Category: ${product.category?.name || 'None'} (slug: ${product.category?.slug || 'None'})`);
        console.log(`    Price: ${product.price} BDT`);
        console.log(`    Is Active: ${product.isActive}`);
        console.log('');
      });
    }

    // Check specifically for keychain products
    const keychainProducts = products.filter(p =>
      p.category?.slug === 'key-chains' ||
      p.category?.slug === 'keychains' ||
      p.name.toLowerCase().includes('key') ||
      p.name.toLowerCase().includes('chain')
    );

    console.log('🔑 Keychain products detected:');
    if (keychainProducts.length === 0) {
      console.log('  No keychain products detected!');
    } else {
      keychainProducts.forEach(product => {
        console.log(`  - ${product.name} (${product.category?.slug})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();