import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const prisma = new PrismaClient();
const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const MIN_PAPERS = 50; // Minimum number of papers to maintain
const REFRESH_HOURS = 24; // Refresh papers every 24 hours

interface ArxivAuthor {
  name: string;
}

interface ArxivEntry {
  id: string;
  title: string;
  author: ArxivAuthor | ArxivAuthor[];
  summary: string;
  published: string;
}

interface ArxivResponse {
  feed: {
    entry: ArxivEntry[];
  };
}

function formatAuthors(author: ArxivAuthor | ArxivAuthor[]): string {
  if (Array.isArray(author)) {
    return author.map(a => a.name).join(', ');
  }
  return author.name;
}

async function fetchAndParsePapers() {
  try {
    const query = 'cat:cs.LG&sortBy=submittedDate&sortOrder=descending&maxResults=100';
    const response = await axios.get(`${ARXIV_API_URL}?search_query=${query}`);
    const parser = new XMLParser({
      ignoreAttributes: true,
      isArray: (name) => name === 'author'
    });
    const result = parser.parse(response.data) as ArxivResponse;
    
    return result.feed.entry.map((entry: ArxivEntry) => ({
      title: entry.title,
      authors: formatAuthors(entry.author),
      abstract: entry.summary,
      arxivId: entry.id.split('/').pop() || '',
      published: entry.published,
    }));
  } catch (error) {
    console.error('Error fetching papers from ArXiv:', error);
    throw error;
  }
}

async function shouldRefreshPapers(): Promise<boolean> {
  // Check if we have less than MIN_PAPERS
  const paperCount = await prisma.paper.count();
  if (paperCount < MIN_PAPERS) return true;
  
  // Get the most recently created paper
  const latestPaper = await prisma.paper.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!latestPaper) return true;

  const hoursSinceLastUpdate = Math.abs(new Date().getTime() - latestPaper.createdAt.getTime()) / 36e5;
  return hoursSinceLastUpdate >= REFRESH_HOURS;
}

async function refreshPapers() {
  const newPapers = await fetchAndParsePapers();
  const now = new Date();

  // Delete old papers if we have more than MIN_PAPERS
  const count = await prisma.paper.count();
  if (count >= MIN_PAPERS) {
    const oldPapers = await prisma.paper.findMany({
      orderBy: { createdAt: 'asc' },
      take: newPapers.length,
    });
    
    for (const paper of oldPapers) {
      await prisma.paper.delete({
        where: { id: paper.id },
      });
    }
  }

  // Add new papers
  for (const paper of newPapers) {
    if (!paper.arxivId) continue;
    
    try {
      await prisma.paper.upsert({
        where: { arxivId: paper.arxivId },
        update: {},
        create: {
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          arxivId: paper.arxivId,
          eloRating: 1500,
          published: new Date(paper.published),
          shown: false,
          createdAt: now,
          updatedAt: now,
        },
      });
    } catch (error) {
      console.error('Error upserting paper:', error);
      continue;
    }
  }
}

async function getRandomPapers() {
  // First, try to get unshown papers
  const unshownPapers = await prisma.paper.findMany({
    where: { shown: false },
  });

  // If we have less than 2 unshown papers, reset all papers to unshown
  if (unshownPapers.length < 2) {
    await prisma.paper.updateMany({
      where: {},
      data: { shown: false },
    });
    // Get fresh list of papers
    return prisma.paper.findMany();
  }

  return unshownPapers;
}

export async function GET() {
  try {
    // Check if we need to refresh papers
    const needsRefresh = await shouldRefreshPapers();
    if (needsRefresh) {
      await refreshPapers();
    }

    // Get available papers, prioritizing unshown ones
    const papers = await getRandomPapers();
    if (papers.length < 2) {
      return NextResponse.json({ error: 'Not enough papers available' }, { status: 500 });
    }

    // Select two different random papers
    const randomIndex1 = Math.floor(Math.random() * papers.length);
    let randomIndex2 = Math.floor(Math.random() * papers.length);
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * papers.length);
    }

    // Mark selected papers as shown
    await prisma.paper.update({
      where: { id: papers[randomIndex1].id },
      data: { shown: true },
    });
    await prisma.paper.update({
      where: { id: papers[randomIndex2].id },
      data: { shown: true },
    });

    return NextResponse.json([papers[randomIndex1], papers[randomIndex2]]);
  } catch (error) {
    console.error('Error getting random papers:', error);
    return NextResponse.json({ error: 'Failed to get random papers' }, { status: 500 });
  }
} 