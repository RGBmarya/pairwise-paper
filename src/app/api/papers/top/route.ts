import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const papers = await prisma.paper.findMany({
      orderBy: { eloRating: 'desc' },
      take: limit,
    });
    
    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error getting top papers:', error);
    return NextResponse.json({ error: 'Failed to get top papers' }, { status: 500 });
  }
} 