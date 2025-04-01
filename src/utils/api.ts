import axios from 'axios';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  arxivId: string;
  eloRating: number;
  published: Date;
}

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  arxivId: string;
  published: Date;
}

interface ApiPaper extends Omit<Paper, 'published'> {
  published: string;
}

export async function fetchRecentMLPapers(): Promise<ArxivPaper[]> {
  const query = 'cat:cs.LG&sortBy=submittedDate&sortOrder=descending&maxResults=100';
  const response = await fetch(
    `https://export.arxiv.org/api/query?search_query=${query}`
  );
  
  if (!response.ok) {
    throw new Error(`ArXiv API request failed with status ${response.status}`);
  }

  const text = await response.text();
  
  // Parse XML response and convert to our format
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const entries = xmlDoc.getElementsByTagName('entry');
  
  return Array.from(entries).map(entry => ({
    id: entry.getElementsByTagName('id')[0]?.textContent || '',
    title: entry.getElementsByTagName('title')[0]?.textContent || '',
    authors: entry.getElementsByTagName('author')[0]?.getElementsByTagName('name')[0]?.textContent || '',
    abstract: entry.getElementsByTagName('summary')[0]?.textContent || '',
    arxivId: entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() || '',
    published: new Date(entry.getElementsByTagName('published')[0]?.textContent || ''),
  }));
}

export async function getRandomPairOfPapers(): Promise<Paper[]> {
  const response = await axios.get<ApiPaper[]>('/api/papers/random');
  return response.data.map((paper: ApiPaper) => ({
    ...paper,
    published: new Date(paper.published),
  }));
}

export async function updateEloRatings(winnerId: string, loserId: string): Promise<void> {
  await axios.post('/api/papers/elo', { winnerId, loserId });
}

export async function getTopPapers(limit: number = 10): Promise<Paper[]> {
  const response = await axios.get<ApiPaper[]>(`/api/papers/top?limit=${limit}`);
  return response.data.map((paper: ApiPaper) => ({
    ...paper,
    published: new Date(paper.published),
  }));
} 