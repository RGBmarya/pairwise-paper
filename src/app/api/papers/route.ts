import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const query = 'cat:cs.LG&sortBy=submittedDate&sortOrder=descending&maxResults=100';
    const response = await axios.get(`http://export.arxiv.org/api/query?search_query=${query}`);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 });
  }
} 