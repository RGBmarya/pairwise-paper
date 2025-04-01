'use client';

import { useState, useEffect } from 'react';
import { getRandomPairOfPapers, updateEloRatings, getTopPapers } from '@/utils/api';
import type { Paper } from '@/utils/api';

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [topPapers, setTopPapers] = useState<Paper[]>([]);
  const [loadingPaperId, setLoadingPaperId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadPapers();
  }, []);

  async function loadPapers() {
    try {
      const [newPapers, newTopPapers] = await Promise.all([
        getRandomPairOfPapers(),
        getTopPapers()
      ]);
      setPapers(newPapers);
      setTopPapers(newTopPapers);
    } catch (error) {
      console.error('Failed to load papers:', error);
    } finally {
      setInitialLoading(false);
    }
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  async function handleChoice(winnerId: string) {
    const loserId = papers.find(p => p.id !== winnerId)?.id;
    if (loserId) {
      setLoadingPaperId(winnerId);
      try {
        await updateEloRatings(winnerId, loserId);
        await loadPapers();
      } finally {
        setLoadingPaperId(null);
      }
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 font-cm-serif">
              <a href="https://quanta-app.com" className="underline">Quanta</a> Paper Rankings
            </h1>
            <p className="mt-2 text-sm text-gray-600">Refreshes every 24 hours</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 font-cm-serif">Loading Papers...</h2>
            <p className="mt-2 text-sm text-gray-600">Fetching the latest machine learning papers</p>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} <a href="https://www.quanta-app.com/" className="hover:text-blue-600 underline">Quanta</a>. All rights reserved.
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Created by <a href="https://x.com/mihir__arya" className="hover:text-blue-600 underline">@mihir__arya</a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 font-cm-serif">
            <a href="https://quanta-app.com" className="underline">Quanta</a> Paper Rankings
          </h1>
          <p className="mt-2 text-sm text-gray-600">Refreshes every 24 hours</p>
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
                    disabled={loadingPaperId !== null}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 
                      ${loadingPaperId === paper.id 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : loadingPaperId !== null
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'} 
                      text-white`}
                  >
                    {loadingPaperId === paper.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : 'Choose This Paper'}
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
                        {/* <span className="text-gray-400">•</span> */}
                        {/* <p className="text-sm text-gray-500">{formatDate(paper.published)}</p> */}
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

      <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} <a href="https://www.quanta-app.com/" className="hover:text-blue-600 underline">Quanta</a>. All rights reserved.
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Made with ❤️ (and Cursor) by <a href="https://x.com/mihir__arya" className="hover:text-blue-600 underline">@mihir__arya</a>
            </p>
          </div>
        </footer>
    </div>
  );
}
