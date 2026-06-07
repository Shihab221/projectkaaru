import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestKeychains() {
  try {
    console.log('🔍 Finding key-chains category...');

    // Find the key-chains category
    const category = await prisma.category.findUnique({
      where: { slug: 'key-chains' }
    });

    if (!category) {
      console.error('❌ Key-chains category not found!');
      return;
    }

    console.log('✅ Found category:', category.name);

    // Create some test keychain products
    const keychains = [
      {
        name: 'Custom Name Keychain',
        slug: 'custom-name-keychain',
        description: 'Personalized keychain with your custom name engraved',
        shortDescription: 'Custom name keychain',
        price: 150.00,
        stock: 50,
        isActive: true,
        isTopProduct: true,
        categoryId: category.id,
      },
      {
        name: 'Heart Shape Keychain',
        slug: 'heart-keychain',
        description: 'Beautiful heart-shaped keychain perfect for personalization',
        shortDescription: 'Heart shaped keychain',
        price: 120.00,
        stock: 30,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: 'Metal Tag Keychain',
        slug: 'metal-tag-keychain',
        description: 'Sturdy metal tag keychain for custom text engraving',
        shortDescription: 'Metal tag keychain',
        price: 180.00,
        stock: 25,
        isActive: true,
        categoryId: category.id,
      }
    ];

    console.log('🛠️  Creating test keychain products...');

    for (const keychain of keychains) {
      // Check if product already exists
      const existing = await prisma.product.findUnique({
        where: { slug: keychain.slug }
      });

      if (existing) {
        console.log(`⚠️  Product already exists: ${keychain.name}`);
        continue;
      }

      // Create the product
      await prisma.product.create({
        data: keychain
      });

      console.log(`✅ Created product: ${keychain.name}`);
    }

    console.log('🎉 Test keychain products created successfully!');
    console.log('📋 Products created:');
    keychains.forEach(k => console.log(`   - ${k.name} (${k.price} BDT)`));

  } catch (error) {
    console.error('❌ Error creating test keychains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestKeychains();