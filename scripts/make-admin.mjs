import { PrismaClient } from '../lib/generated/prisma/client.js';

const prisma = new PrismaClient();

async function makeUserAdmin(email) {
  try {
    console.log(`🔄 Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('⚠️  User is already an admin!');
      return;
    }

    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { role: 'admin' }
    });

    console.log('✅ User role updated successfully!');
    console.log(`   New role: ${updatedUser.role}`);

    console.log('\n⚠️  IMPORTANT: The user needs to logout and login again to get a new JWT token with admin privileges.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.log('❌ Usage: node scripts/make-admin.mjs <email>');
  console.log('   Example: node scripts/make-admin.mjs user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
