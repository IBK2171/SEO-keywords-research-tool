import React, { useState } from 'react';

interface KeywordInputProps {
  onSubmit: (seedKeyword: string, numKeywords: number) => void;
  isLoading: boolean;
  onApiKeySelect: () => Promise<void>;
  hasApiKey: boolean;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit, isLoading, onApiKeySelect, hasApiKey }) => {
  const [seedKeyword, setSeedKeyword] = useState<string>('');
  const [numKeywords, setNumKeywords] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!seedKeyword.trim()) {
      setError('Please enter a seed keyword.');
      return;
    }
    if (numKeywords < 1 || numKeywords > 20) {
      setError('Number of keywords must be between 1 and 20.');
      return;
    }
    onSubmit(seedKeyword, numKeywords);
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-lg shadow-xl mb-8 border border-gray-100 sticky top-0 z-10 w-full">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Keyword Research Tool</h2>
      <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
        Enter a seed keyword to generate a list of related long-tail keywords along with simulated SEO metrics
        (difficulty, search volume), content ideas, and potential SERP features.
        These metrics are for illustrative purposes and are not real-time data.
      </p>

      {!hasApiKey && (
        <div className="text-center mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          <p className="mb-2 font-medium">An API key is required to use this tool.</p>
          <button
            onClick={onApiKeySelect}
            className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Select API Key
          </button>
          <p className="text-sm mt-2">
            Learn more about billing: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-700 underline hover:text-yellow-900">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      )}

      {hasApiKey && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="seed-keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Seed Keyword / Topic
            </label>
            <input
              type="text"
              id="seed-keyword"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., 'sustainable living tips', 'best coffee makers'"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="num-keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Keywords (1-20)
            </label>
            <input
              type="number"
              id="num-keywords"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={numKeywords}
              onChange={(e) => setNumKeywords(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              min="1"
              max="20"
              disabled={isLoading}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !hasApiKey}
          >
            {isLoading ? 'Generating...' : 'Generate Keywords'}
          </button>
        </form>
      )}
    </div>
  );
};

export default KeywordInput;
