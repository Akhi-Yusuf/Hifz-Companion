import React from 'react';
import { useMemorization } from '../context/MemorizationContext';
import { MemorizationPhase } from '../types';
import { createVerseWithHoles } from '../lib/quranApi';
import { AudioPlayer } from './AudioPlayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { HighlightedVerseDisplay } from './HighlightedVerseDisplay';

export function VerseDisplay() {
  const { 
    selectedSurah, 
    currentVerse, 
    currentPhase, 
    nextVerse, 
    previousVerse,
    loading,
    audioElement,
    audioPlaying
  } = useMemorization();

  const renderVerseContent = () => {
    if (!currentVerse) return null;
    
    switch (currentPhase) {
      case MemorizationPhase.TextWithAudio:
        return (
          <HighlightedVerseDisplay 
            text={currentVerse.text} 
            audioElement={audioElement}
            audioPlaying={audioPlaying}
            phase={currentPhase}
          />
        );
      case MemorizationPhase.TextWithoutAudio:
        return (
          <div className="arabic-text text-right text-2xl mb-4" dir="rtl">
            {currentVerse.text}
          </div>
        );
      case MemorizationPhase.TextWithHoles:
        return (
          <div 
            className="arabic-text text-right text-2xl mb-4" 
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: createVerseWithHoles(currentVerse.text) }}
          />
        );
      case MemorizationPhase.EmptyWithAudio:
        return (
          <div className="text-center text-xl italic text-gray-500 dark:text-gray-400 mb-4">
            [Listen to the audio and recite from memory]
          </div>
        );
      case MemorizationPhase.CompleteMemorization:
        return (
          <div className="text-center text-xl italic text-gray-500 dark:text-gray-400 mb-4">
            [Recite the verse completely from memory]
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || !currentVerse) {
    return (
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        
        <Skeleton className="h-16 w-full mb-6" />
        
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-5 w-full" />
        </div>
        
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium text-primary">
          {selectedSurah?.englishName} ({selectedSurah?.name}) 
          <span className="ml-2">({currentVerse.numberInSurah})</span>
        </h2>
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => previousVerse()}
            disabled={currentVerse.numberInSurah <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => nextVerse()}
            disabled={!selectedSurah || currentVerse.numberInSurah >= selectedSurah.numberOfAyahs}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Verse Content Display */}
      <div className="mb-6">
        {renderVerseContent()}
      </div>

      {/* Translation */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Translation:</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {currentVerse.translation}
        </p>
      </div>
      
      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}
