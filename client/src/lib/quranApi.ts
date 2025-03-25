import { Surah, Verse } from "../types";

// Base URL for the Quran API proxy
const API_BASE_URL = "/api/quran";

// Fetch all surahs
export async function fetchSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/surahs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    throw error;
  }
}

// Fetch a specific surah with its verses
export async function fetchSurah(surahId: number): Promise<{surah: Surah, verses: Verse[]}> {
  try {
    const response = await fetch(`${API_BASE_URL}/surah/${surahId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      surah: {
        number: data.data.number,
        name: data.data.name,
        englishName: data.data.englishName,
        englishNameTranslation: data.data.englishNameTranslation,
        numberOfAyahs: data.data.numberOfAyahs,
        revelationType: data.data.revelationType
      },
      verses: data.data.ayahs.map((ayah: any) => ({
        ...ayah,
        surah: {
          number: data.data.number,
          name: data.data.name,
          englishName: data.data.englishName,
          englishNameTranslation: data.data.englishNameTranslation,
          revelationType: data.data.revelationType,
          numberOfAyahs: data.data.numberOfAyahs
        },
        audio: getAudioUrl(data.data.number, ayah.numberInSurah),
        // Translation should already be included from our API
      }))
    };
  } catch (error) {
    console.error(`Error fetching surah ${surahId}:`, error);
    throw error;
  }
}

// Fetch a specific verse
export async function fetchVerse(surahId: number, verseNumber: number): Promise<Verse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verse/${surahId}/${verseNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.statusText}`);
    }
    const data = await response.json();
    const verse = data.data;
    
    return {
      ...verse,
      audio: getAudioUrl(surahId, verseNumber),
      // translation should already be included from our API
    };
  } catch (error) {
    console.error(`Error fetching verse ${surahId}:${verseNumber}:`, error);
    throw error;
  }
}

// Generate audio URL for a verse
export function getAudioUrl(surahId: number, verseNumber: number): string {
  return `${API_BASE_URL}/audio/${surahId}/${verseNumber}`;
}

// Helper function to create verse text with "holes" (missing words)
export function createVerseWithHoles(verseText: string): string {
  if (!verseText) return "";
  
  const words = verseText.split(" ");
  // Replace about 30% of words with holes
  return words.map((word, index) => {
    if (index % 3 === 1) { // Replace every third word
      return "<span class='hole'></span>";
    }
    return word;
  }).join(" ");
}

// Get progress from the API
export async function getProgress(userId: number, surahId: number, verseNumber: number) {
  try {
    const response = await fetch(`/api/progress/${userId}/${surahId}/${verseNumber}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch progress: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
}

// Update progress
export async function updateProgress(progress: {
  userId: number;
  surahId: number;
  verseNumber: number;
  phase: number;
  completed: boolean;
}) {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...progress,
        lastAccessed: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update progress: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
}
