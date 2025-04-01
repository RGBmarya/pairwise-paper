import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const prisma = new PrismaClient();
const ARXIV_API_URL = 'http://export.arxiv.org/api/query';

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
  const query = 'cat:cs.LG&sortBy=submittedDate&sortOrder=descending&maxResults=100';
  const response = await axios.get(`${ARXIV_API_URL}?search_query=${query}`);
  const parser = new XMLParser();
  const result = parser.parse(response.data) as ArxivResponse;
  
  return result.feed.entry.map((entry: ArxivEntry) => {
    const arxivId = entry.id.split('/').pop();
    if (!arxivId) {
      throw new Error('Invalid ArXiv ID');
    }
    return {
      id: entry.id,
      title: entry.title,
      authors: formatAuthors(entry.author),
      abstract: entry.summary,
      arxivId,
      published: entry.published,
    };
  });
}

export async function GET() {
  try {
    const papers = await prisma.paper.findMany();
    if (papers.length < 2) {
      const newPapers = await fetchAndParsePapers();
      for (const paper of newPapers) {
        await prisma.paper.upsert({
          where: { arxivId: paper.arxivId },
          update: {},
          create: {
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            arxivId: paper.arxivId,
            published: new Date(paper.published),
            eloRating: 1500,
          },
        });
      }
      return GET();
    }
    
    const randomIndex1 = Math.floor(Math.random() * papers.length);
    let randomIndex2 = Math.floor(Math.random() * papers.length);
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * papers.length);
    }
    
    return NextResponse.json([papers[randomIndex1], papers[randomIndex2]]);
  } catch (error) {
    console.error('Error getting random papers:', error);
    return NextResponse.json({ error: 'Failed to get random papers' }, { status: 500 });
  }
} 