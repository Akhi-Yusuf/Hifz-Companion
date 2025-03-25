import React from 'react';
import { Button } from '@/components/ui/button';
import { useMemorization } from '../context/MemorizationContext';
import { MemorizationPhase } from '../types';

export function NavigationControls() {
  const { 
    currentPhase, 
    nextPhase, 
    nextVerse, 
    retryVerse, 
    selectedSurah, 
    currentVerse 
  } = useMemorization();
  
  const isLastPhase = currentPhase === MemorizationPhase.CompleteMemorization;
  const isLastVerse = selectedSurah && currentVerse && 
                     currentVerse.numberInSurah >= selectedSurah.numberOfAyahs;

  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={retryVerse}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
      >
        Retry This Verse
      </Button>
      
      <div className="space-x-3">
        <Button 
          variant="secondary"
          onClick={nextPhase}
          disabled={isLastPhase}
          className="px-4 py-2 text-white rounded-md"
        >
          Complete Phase
        </Button>
        
        <Button 
          variant="default"
          onClick={nextVerse}
          disabled={isLastVerse}
          className="px-4 py-2 text-white rounded-md"
        >
          Next Verse
        </Button>
      </div>
    </div>
  );
}
