import React from 'react';
import { useMemorization } from '../context/MemorizationContext';
import { MemorizationPhase } from '../types';

export function ProgressTracker() {
  const { 
    currentPhase, 
    currentVerse, 
    selectedSurah 
  } = useMemorization();
  
  // Calculate progress percentage based on current phase
  const progressPercentage = ((currentPhase - 1) / 4) * 100;
  
  if (!currentVerse || !selectedSurah) {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-3">Session Progress</h2>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
        <div 
          className="bg-green-500 h-4 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Phase {currentPhase}/5</span>
        <span>
          Verse {currentVerse.numberInSurah}/{selectedSurah.numberOfAyahs}
        </span>
      </div>
    </div>
  );
}
