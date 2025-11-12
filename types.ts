export interface KeywordData {
  id: string;
  keyword: string;
  difficulty: 'Low' | 'Medium' | 'High' | 'Very High';
  searchVolume: '0-10' | '10-100' | '100-1K' | '1K-10K' | '10K-100K' | '100K+';
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High'; // Added competition level
  estimatedCpc: string; // Added estimated Cost-Per-Click
  contentIdeas: string[];
  serpFeatures: string[];
}

export type DifficultyLevel = KeywordData['difficulty'];
export type SearchVolumeRange = KeywordData['searchVolume'];
export type CompetitionLevel = KeywordData['competitionLevel']; // New type alias
export type EstimatedCpc = KeywordData['estimatedCpc']; // New type alias