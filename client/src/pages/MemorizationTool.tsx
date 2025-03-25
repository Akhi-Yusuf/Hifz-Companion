import React from 'react';
import { SurahSelector } from '../components/SurahSelector';
import { MemorizationPhases } from '../components/MemorizationPhases';
import { VerseDisplay } from '../components/VerseDisplay';
import { NavigationControls } from '../components/NavigationControls';
import { ProgressTracker } from '../components/ProgressTracker';
import { MemorizationProvider } from '../context/MemorizationContext';

export default function MemorizationTool() {
  return (
    <MemorizationProvider>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-primary mb-2">Quran Memorization Tool</h1>
          <p className="text-gray-600 dark:text-gray-300">Progressive memorization through 5 phases</p>
        </header>
        
        <SurahSelector />
        <MemorizationPhases />
        <VerseDisplay />
        <NavigationControls />
        <ProgressTracker />
      </div>
    </MemorizationProvider>
  );
}
