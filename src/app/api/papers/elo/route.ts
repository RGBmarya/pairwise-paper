import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { winnerId, loserId } = await request.json();
    const K_FACTOR = 32;
    
    const winner = await prisma.paper.findUnique({ where: { id: winnerId } });
    const loser = await prisma.paper.findUnique({ where: { id: loserId } });
    
    if (!winner || !loser) {
      return NextResponse.json({ error: 'Papers not found' }, { status: 404 });
    }
    
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.eloRating - winner.eloRating) / 400));
    const expectedLoser = 1 - expectedWinner;
    
    const newWinnerRating = winner.eloRating + K_FACTOR * (1 - expectedWinner);
    const newLoserRating = loser.eloRating + K_FACTOR * (0 - expectedLoser);
    
    await prisma.paper.update({
      where: { id: winnerId },
      data: { eloRating: newWinnerRating },
    });
    
    await prisma.paper.update({
      where: { id: loserId },
      data: { eloRating: newLoserRating },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ELO ratings:', error);
    return NextResponse.json({ error: 'Failed to update ELO ratings' }, { status: 500 });
  }
} 