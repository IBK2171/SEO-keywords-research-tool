import React from 'react';
import { KeywordData, DifficultyLevel, SearchVolumeRange, CompetitionLevel } from '../types';

interface KeywordCardProps {
  keywordData: KeywordData;
  onSave: (keyword: KeywordData) => void;
  isSaved: boolean;
}

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Very High':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCompetitionColor = (competition: CompetitionLevel) => {
  switch (competition) {
    case 'Low':
      return 'bg-teal-100 text-teal-800';
    case 'Medium':
      return 'bg-amber-100 text-amber-800';
    case 'High':
      return 'bg-rose-100 text-rose-800';
    case 'Very High':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getVolumeColor = (volume: SearchVolumeRange) => {
  if (volume === '100K+' || volume === '10K-100K') {
    return 'bg-indigo-100 text-indigo-800';
  }
  if (volume === '1K-10K') {
    return 'bg-blue-100 text-blue-800';
  }
  if (volume === '100-1K') {
    return 'bg-sky-100 text-sky-800';
  }
  return 'bg-gray-100 text-gray-800';
};

const serpFeatureDetails: { [key: string]: { description: string; icon: string } } = {
  'Featured Snippet': { description: 'A concise answer extracted directly from a webpage, displayed at the top of search results.', icon: '💡' },
  'People Also Ask': { description: 'A box showing common questions related to the search query, expandable to reveal answers.', icon: '❓' },
  'Videos': { description: 'Video results from platforms like YouTube, often with thumbnails and playback options.', icon: '▶️' },
  'Images': { description: 'Image results displayed prominently, often in a carousel or grid format.', icon: '🖼️' },
  'Shopping': { description: 'Product listings, often with prices, images, and reviews, for e-commerce queries.', icon: '🛍️' },
  'Local Pack': { description: 'A map and a list of local businesses relevant to the search query, showing location and contact info.', icon: '📍' },
  'Knowledge Panel': { description: 'An information box that appears for entities like people, places, organizations, or things, summarizing key facts.', icon: '🧠' },
  'Top Stories': { description: 'A carousel of recent news articles related to the query, typically for current events.', icon: '📰' },
  'Reviews': { description: 'Star ratings and snippets from reviews for products, services, or businesses.', icon: '⭐' },
  'Sitelinks': { description: 'Additional links indented under a main search result, directing to specific pages within a website.', icon: '🔗' },
  'Recipes': { description: 'Structured results displaying recipes, often with ratings, cook times, and ingredients.', icon: '🧑‍🍳' },
  'Flights': { description: 'Information about flight schedules, prices, and booking options.', icon: '✈️' },
  'Hotels': { description: 'Listings for hotels with prices, ratings, and booking links.', icon: '🏨' },
  'Events': { description: 'Information about upcoming events, including dates, locations, and tickets.', icon: '🗓️' },
  'Job Listings': { description: 'A collection of job openings relevant to the search query.', icon: '💼' },
  'AdWords Top': { description: 'Paid advertisements displayed at the very top of the search results page.', icon: '💰' },
  'AdWords Bottom': { description: 'Paid advertisements displayed at the bottom of the search results page.', icon: '💸' },
};


const KeywordCard: React.FC<KeywordCardProps> = ({ keywordData, onSave, isSaved }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3 break-words">
          {keywordData.keyword}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(keywordData.difficulty)}`}>
            Difficulty: {keywordData.difficulty}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getVolumeColor(keywordData.searchVolume)}`}>
            Search Volume: {keywordData.searchVolume}
          </span>
          {/* New: Competition Level */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCompetitionColor(keywordData.competitionLevel)}`}>
            Competition: {keywordData.competitionLevel}
          </span>
          {/* New: Estimated CPC */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-800">
            Est. CPC: {keywordData.estimatedCpc}
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Content Ideas:</h4>
          {keywordData.contentIdeas.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
              {keywordData.contentIdeas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No content ideas provided.</p>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">SERP Features:</h4>
          {keywordData.serpFeatures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordData.serpFeatures.map((feature, index) => {
                const details = serpFeatureDetails[feature] || { description: feature, icon: '📄' };
                return (
                  <div key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 relative group cursor-help flex items-center gap-1">
                    {details.icon} {feature}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-center shadow-lg">
                      {details.description}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No specific SERP features noted.</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onSave(keywordData)}
        disabled={isSaved}
        className={`mt-4 w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200
          ${isSaved ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}`}
      >
        {isSaved ? 'Saved' : 'Save Keyword'}
      </button>
    </div>
  );
};

export default KeywordCard;