import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemorization } from '../context/MemorizationContext';
import { Skeleton } from '@/components/ui/skeleton';

export function SurahSelector() {
  const { 
    surahs, 
    selectedSurah, 
    selectedVerseNumber, 
    selectSurah, 
    selectVerse, 
    loading 
  } = useMemorization();

  const handleSurahChange = async (surahId: string) => {
    await selectSurah(parseInt(surahId));
  };

  const handleVerseChange = async (verseNumber: string) => {
    await selectVerse(parseInt(verseNumber));
  };

  if (loading && surahs.length === 0) {
    return (
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Surah
            </Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Starting Verse
            </Label>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="surah-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Surah
          </Label>
          <Select 
            value={selectedSurah?.number.toString() || "1"} 
            onValueChange={handleSurahChange}
          >
            <SelectTrigger id="surah-select" className="w-full">
              <SelectValue placeholder="Select a Surah" />
            </SelectTrigger>
            <SelectContent>
              {surahs.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.englishName} ({surah.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="verse-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Starting Verse
          </Label>
          <Select 
            value={selectedVerseNumber.toString()} 
            onValueChange={handleVerseChange}
            disabled={!selectedSurah}
          >
            <SelectTrigger id="verse-select" className="w-full">
              <SelectValue placeholder="Select verse" />
            </SelectTrigger>
            <SelectContent>
              {selectedSurah && Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map((verseNumber) => (
                <SelectItem key={verseNumber} value={verseNumber.toString()}>
                  Verse {verseNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
