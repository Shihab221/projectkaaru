import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const categories = DEFAULT_CATEGORIES;

    console.log('Start seeding categories...');

    const results = [];
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existingCategory) {
        const createdCategory = await prisma.category.create({
          data: category
        });
        results.push({ action: 'created', category: createdCategory });
        console.log(`Created category: ${category.name}`);
      } else {
        results.push({ action: 'exists', category: existingCategory });
        console.log(`Category already exists: ${category.name}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Categories seeding completed',
      results
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
