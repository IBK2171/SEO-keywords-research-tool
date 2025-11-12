import React, { useState, useEffect, useCallback, useMemo } from 'react';
import KeywordInput from './components/KeywordInput';
import KeywordCard from './components/KeywordCard';
import LoadingSpinner from './components/LoadingSpinner';
import { generateKeywordsAndMetrics } from './services/geminiService';
import { KeywordData, DifficultyLevel, SearchVolumeRange, CompetitionLevel } from './types';

// Declare window.aistudio for API key selection functions.
// As per coding guidelines, assume window.aistudio and its types are pre-configured and accessible.
// This means no explicit declare global or interface definition is needed here.

const LOCAL_STORAGE_KEY = 'seoKeywords_saved';

const difficultyOptions: (DifficultyLevel | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Very High'];
const searchVolumeOptions: (SearchVolumeRange | 'All')[] = ['All', '0-10', '10-100', '100-1K', '1K-10K', '10K-100K', '100K+'];
const competitionOptions: (CompetitionLevel | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Very High']; // New competition filter options

function App() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [savedKeywords, setSavedKeywords] = useState<KeywordData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<SearchVolumeRange | 'All'>('All');
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] = useState<CompetitionLevel | 'All'>('All'); // New competition filter state

  // Helper to load saved keywords from local storage
  const loadSavedKeywords = useCallback(() => {
    try {
      const storedKeywords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedKeywords) {
        setSavedKeywords(JSON.parse(storedKeywords));
      }
    } catch (e) {
      console.error("Failed to load saved keywords from local storage:", e);
      setSavedKeywords([]); // Reset if there's an issue
    }
  }, []);

  // Helper to save current saved keywords to local storage
  const saveKeywordsToLocalStorage = useCallback((keywordsToSave: KeywordData[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keywordsToSave));
    } catch (e) {
      console.error("Failed to save keywords to local storage:", e);
    }
  }, []);

  const checkApiKey = useCallback(async () => {
    try {
      // Assuming window.aistudio is available and typed by the environment as per guidelines
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);
      } else {
        // Fallback for environments where aistudio might not be present or fully initialized
        // Assume API_KEY is present from process.env for development/local testing.
        setHasApiKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key availability:", e);
      setHasApiKey(false);
    }
  }, []);

  const selectApiKey = useCallback(async () => {
    try {
      // Assuming window.aistudio is available and typed by the environment as per guidelines
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assuming key selection was successful to avoid race condition
        setHasApiKey(true);
      } else {
        console.warn("window.aistudio.openSelectKey is not available.");
        setError("API Key selection is not available in this environment. Please ensure process.env.API_KEY is set.");
      }
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Failed to open API key selection. Please try again.");
    }
  }, []);

  // Load saved keywords and check API key on initial mount
  useEffect(() => {
    loadSavedKeywords();
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateKeywords = useCallback(async (seedKeyword: string, numKeywords: number) => {
    setIsLoading(true);
    setError(null);
    setKeywords([]); // Clear previous results

    try {
      if (!hasApiKey) {
        setError("API Key not selected. Please select your API key to proceed.");
        setIsLoading(false);
        return;
      }
      const generatedKeywords = await generateKeywordsAndMetrics(seedKeyword, numKeywords);
      setKeywords(generatedKeywords);
    } catch (err: any) {
      console.error("Failed to generate keywords:", err);
      // Specific handling for API key related errors
      if (err.message.includes("Requested entity was not found.")) { // More specific check for 'Requested entity was not found.'
        setHasApiKey(false); // Prompt user to re-select key
        setError("API Key invalid or expired, or model not found. Please select your API key again.");
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasApiKey]);

  const handleSaveKeyword = useCallback((keywordToSave: KeywordData) => {
    setSavedKeywords((prevSaved) => {
      // Check if keyword is already saved to prevent duplicates based on ID
      if (prevSaved.some(kw => kw.id === keywordToSave.id)) {
        return prevSaved;
      }
      const newSaved = [...prevSaved, keywordToSave];
      saveKeywordsToLocalStorage(newSaved);
      return newSaved;
    });
  }, [saveKeywordsToLocalStorage]);

  const isKeywordSaved = useCallback((keyword: KeywordData) => {
    return savedKeywords.some(sk => sk.id === keyword.id);
  }, [savedKeywords]);

  const handleClearAllSavedKeywords = useCallback(() => {
    setSavedKeywords([]);
    saveKeywordsToLocalStorage([]);
    setSelectedDifficultyFilter('All'); // Reset filters when clearing all
    setSelectedVolumeFilter('All');
    setSelectedCompetitionFilter('All'); // Reset new competition filter
  }, [saveKeywordsToLocalStorage]);

  const filteredSavedKeywords = useMemo(() => {
    return savedKeywords.filter(kw => {
      const matchesDifficulty = selectedDifficultyFilter === 'All' || kw.difficulty === selectedDifficultyFilter;
      const matchesVolume = selectedVolumeFilter === 'All' || kw.searchVolume === selectedVolumeFilter;
      const matchesCompetition = selectedCompetitionFilter === 'All' || kw.competitionLevel === selectedCompetitionFilter; // Apply new competition filter
      return matchesDifficulty && matchesVolume && matchesCompetition;
    });
  }, [savedKeywords, selectedDifficultyFilter, selectedVolumeFilter, selectedCompetitionFilter]);


  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full">
        <KeywordInput
          onSubmit={handleGenerateKeywords}
          isLoading={isLoading}
          onApiKeySelect={selectApiKey}
          hasApiKey={hasApiKey}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {keywords.length > 0 && (
          <>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Generated Keywords</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {keywords.map((kw) => (
                <KeywordCard
                  key={kw.id}
                  keywordData={kw}
                  onSave={handleSaveKeyword}
                  isSaved={isKeywordSaved(kw)}
                />
              ))}
            </div>
          </>
        )}

        {!isLoading && keywords.length === 0 && savedKeywords.length === 0 && !error && (
          <div className="text-center text-gray-500 text-lg mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <p>Start by entering a seed keyword above to begin your research!</p>
          </div>
        )}

        {savedKeywords.length > 0 && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-3xl font-extrabold text-gray-900">Your Saved Keywords</h3>
              <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
                <label htmlFor="difficulty-filter" className="sr-only">Filter by Difficulty</label>
                <select
                  id="difficulty-filter"
                  value={selectedDifficultyFilter}
                  onChange={(e) => setSelectedDifficultyFilter(e.target.value as DifficultyLevel | 'All')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-label="Filter by keyword difficulty"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>{option} Difficulty</option>
                  ))}
                </select>

                <label htmlFor="volume-filter" className="sr-only">Filter by Search Volume</label>
                <select
                  id="volume-filter"
                  value={selectedVolumeFilter}
                  onChange={(e) => setSelectedVolumeFilter(e.target.value as SearchVolumeRange | 'All')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-label="Filter by search volume"
                >
                  {searchVolumeOptions.map((option) => (
                    <option key={option} value={option}>{option} Volume</option>
                  ))}
                </select>

                {/* New: Competition Level Filter */}
                <label htmlFor="competition-filter" className="sr-only">Filter by Competition</label>
                <select
                  id="competition-filter"
                  value={selectedCompetitionFilter}
                  onChange={(e) => setSelectedCompetitionFilter(e.target.value as CompetitionLevel | 'All')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-label="Filter by competition level"
                >
                  {competitionOptions.map((option) => (
                    <option key={option} value={option}>{option} Competition</option>
                  ))}
                </select>

                <button
                  onClick={handleClearAllSavedKeywords}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
            </div>
            {filteredSavedKeywords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSavedKeywords.map((kw) => (
                  <KeywordCard
                    key={kw.id}
                    keywordData={kw}
                    onSave={handleSaveKeyword} // This function will no-op for already saved keywords
                    isSaved={true} // Always true for keywords in the saved section
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-lg mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <p>No saved keywords match the current filter criteria.</p>
              </div>
            )}
          </div>
        )}
        {/* Only show 'no keywords saved yet' if there are no generated keywords AND no saved keywords at all */}
        {!isLoading && keywords.length > 0 && savedKeywords.length === 0 && !error && (
          <div className="text-center text-gray-500 text-lg mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <p>No keywords saved yet. Click 'Save Keyword' on any generated card to add it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;