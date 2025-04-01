'use client';

import { useState, useEffect } from 'react';
import { getRandomPairOfPapers, updateEloRatings, getTopPapers } from '@/utils/api';
import type { Paper } from '@/utils/api';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [topPapers, setTopPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPapers();
  }, []);

  async function loadPapers() {
    setLoading(true);
    const [paper1, paper2] = await getRandomPairOfPapers();
    setPapers([paper1, paper2]);
    const top = await getTopPapers();
    setTopPapers(top);
    setLoading(false);
  }

  async function handleChoice(winnerId: string) {
    const loserId = papers.find(p => p.id !== winnerId)?.id;
    if (loserId) {
      await updateEloRatings(winnerId, loserId);
      await loadPapers();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 font-cm-serif">
            <a href="https://www.quanta-app.com/" className="underline">Quanta</a> Paper Rankings
          </h1>
          <p className="mt-2 text-sm text-gray-600">Where infinite scroll meets infinite knowledge</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-cm-serif text-center">Which paper do you like more?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {papers.map((paper) => (
            <div 
              key={paper.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6 flex flex-col h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 font-cm-serif">{paper.title}</h2>
                    <span className="text-sm text-gray-500">Rating: {Math.round(paper.eloRating)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">By {paper.authors}</p>
                    <p className="text-sm text-gray-500">{formatDate(paper.published)}</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 font-cm-serif">Abstract</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{paper.abstract}</p>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handleChoice(paper.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Choose This Paper
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-cm-serif">Current Rankings</h2>
            <div className="space-y-4">
              {topPapers.map((paper, index) => (
                <div 
                  key={paper.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-900">#{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 font-cm-serif">{paper.title}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">{paper.authors}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-500">{formatDate(paper.published)}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    Rating: {Math.round(paper.eloRating)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Quanta Paper Rankings. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
