import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Surah, Verse, MemorizationPhase } from '../types';
import { fetchSurahs, fetchSurah, fetchVerse, getProgress, updateProgress } from '../lib/quranApi';
import { useStableInitialization } from '../hooks/use-stable-initialization';

interface MemorizationContextType {
  // State
  surahs: Surah[];
  selectedSurah: Surah | null;
  selectedVerseNumber: number;
  currentVerse: Verse | null;
  currentPhase: MemorizationPhase;
  loading: boolean;
  error: string | null;
  audioPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  
  // Functions
  selectSurah: (surahId: number) => Promise<void>;
  selectVerse: (verseNumber: number) => Promise<void>;
  setPhase: (phase: MemorizationPhase) => void;
  nextPhase: () => void;
  nextVerse: () => Promise<void>;
  previousVerse: () => Promise<void>;
  playAudio: () => void;
  pauseAudio: () => void;
  resetAudio: () => void;
  retryVerse: () => void;
}

const MemorizationContext = createContext<MemorizationContextType | undefined>(undefined);

// Temp user ID for progress tracking
const DEFAULT_USER_ID = 1;

// Define the provider component
function MemorizationProvider({ children }: { children: ReactNode }) {
  // Core state
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number>(1);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [currentPhase, setCurrentPhase] = useState<MemorizationPhase>(MemorizationPhase.TextWithAudio);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Helper function to create and set up a new audio element
  const createAndSetupAudio = useCallback((audioUrl: string) => {
    // Clean up any previous audio element
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement.load();
    }
    
    try {
      // Create a new audio element with proper handling
      const newAudio = new Audio();
      
      // Add event listeners for better error handling
      newAudio.addEventListener('error', (e) => {
        console.error("Audio loading error:", e);
      });
      
      // Set preload before setting source
      newAudio.preload = 'auto';
      
      // Set source last to start loading
      newAudio.src = audioUrl;
      
      setAudioElement(newAudio);
      return newAudio;
    } catch (err) {
      console.error("Error creating audio element:", err);
      return null;
    }
  }, [audioElement]);
  
  const playAudio = useCallback(() => {
    if (audioElement) {
      if (audioElement.readyState < 2) {  // HAVE_CURRENT_DATA = 2
        // If not loaded enough, set up event listener for when it's ready
        const onCanPlay = () => {
          audioElement.play()
            .then(() => setAudioPlaying(true))
            .catch(err => {
              console.error("Error playing audio after loading:", err);
              setAudioPlaying(false);
            });
          // Remove listener after playing
          audioElement.removeEventListener('canplay', onCanPlay);
        };
        
        audioElement.addEventListener('canplay', onCanPlay);
        
        // Also add a timeout in case loading takes too long
        setTimeout(() => {
          if (!audioPlaying && audioElement) {
            try {
              audioElement.play()
                .then(() => setAudioPlaying(true))
                .catch(() => {
                  // Silently ignore this error as we already have a fallback
                });
            } catch (e) {
              // Ignore any errors
            }
          }
        }, 2000);
      } else {
        // Already loaded, can play immediately
        audioElement.play()
          .then(() => setAudioPlaying(true))
          .catch(err => {
            console.error("Error playing audio:", err);
            setAudioPlaying(false);
          });
      }
    }
  }, [audioElement, audioPlaying]);
  
  const pauseAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      setAudioPlaying(false);
    }
  }, [audioElement]);
  
  const resetAudio = useCallback(() => {
    if (audioElement) {
      audioElement.currentTime = 0;
      setAudioPlaying(false);
    }
  }, [audioElement]);
    
  // Define all handlers first to avoid circular dependency issues
  
  const selectSurahImpl = async (surahId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the selected surah with its verses
      const { surah } = await fetchSurah(surahId);
      setSelectedSurah(surah);
      
      // Reset to first verse
      const verseNumber = 1;
      
      // Check if verse number is valid
      if (verseNumber < 1 || verseNumber > surah.numberOfAyahs) {
        throw new Error('Invalid verse number');
      }
      
      // Fetch the selected verse
      const verse = await fetchVerse(surah.number, verseNumber);
      
      setSelectedVerseNumber(verseNumber);
      setCurrentVerse(verse);
      
      // Create and setup new audio element using our helper function
      createAndSetupAudio(verse.audio);
      
      // Check if there's existing progress
      const progress = await getProgress(DEFAULT_USER_ID, surah.number, verseNumber);
      if (progress) {
        setCurrentPhase(progress.phase);
      } else {
        setCurrentPhase(MemorizationPhase.TextWithAudio);
      }
    } catch (err) {
      setError("Failed to load Surah. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Memoize the implementation
  const selectSurah = useCallback(selectSurahImpl, [createAndSetupAudio]);
  
  const selectVerse = useCallback(async (verseNumber: number) => {
    try {
      if (!selectedSurah) return;
      
      setLoading(true);
      setError(null);
      
      // Check if verse number is valid
      if (verseNumber < 1 || verseNumber > selectedSurah.numberOfAyahs) {
        throw new Error('Invalid verse number');
      }
      
      // Fetch the selected verse
      const verse = await fetchVerse(selectedSurah.number, verseNumber);
      
      setSelectedVerseNumber(verseNumber);
      setCurrentVerse(verse);
      
      // Reset audio playing state
      setAudioPlaying(false);
      
      // Create and setup new audio element using our helper function
      createAndSetupAudio(verse.audio);
      
      // Check if there's existing progress
      const progress = await getProgress(DEFAULT_USER_ID, selectedSurah.number, verseNumber);
      if (progress) {
        setCurrentPhase(progress.phase);
      } else {
        setCurrentPhase(MemorizationPhase.TextWithAudio);
      }
    } catch (err) {
      setError("Failed to load verse. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSurah, createAndSetupAudio]);
  
  // Use the stable initialization hook to fetch surahs only once
  useStableInitialization(() => {
    async function loadSurahs() {
      try {
        setLoading(true);
        const fetchedSurahs = await fetchSurahs();
        setSurahs(fetchedSurahs);
        
        // Only select first surah by default if none is selected
        if (fetchedSurahs.length > 0 && !selectedSurah) {
          await selectSurah(fetchedSurahs[0].number);
        }
      } catch (err) {
        setError("Failed to load Surahs. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSurahs();
    
    // Cleanup audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);  // Empty dependency array for one-time initialization
  
  const nextPhase = useCallback(async () => {
    if (currentPhase < MemorizationPhase.CompleteMemorization) {
      const newPhase = currentPhase + 1 as MemorizationPhase;
      setCurrentPhase(newPhase);
      
      // Save progress
      if (selectedSurah && currentVerse) {
        try {
          await updateProgress({
            userId: DEFAULT_USER_ID,
            surahId: selectedSurah.number,
            verseNumber: selectedVerseNumber,
            phase: newPhase,
            completed: newPhase === MemorizationPhase.CompleteMemorization
          });
        } catch (err) {
          console.error("Failed to update progress:", err);
        }
      }
      
      // We no longer auto-play audio, user will press the play button when ready
      // Reset audio to the beginning 
      if (audioElement) {
        resetAudio();
      }
    }
  }, [currentPhase, selectedSurah, currentVerse, selectedVerseNumber, audioElement, resetAudio]);
  
  const nextVerse = useCallback(async () => {
    if (!selectedSurah) return;
    
    if (selectedVerseNumber < selectedSurah.numberOfAyahs) {
      await selectVerse(selectedVerseNumber + 1);
    }
  }, [selectedSurah, selectedVerseNumber, selectVerse]);
  
  const previousVerse = useCallback(async () => {
    if (selectedVerseNumber > 1) {
      await selectVerse(selectedVerseNumber - 1);
    }
  }, [selectedVerseNumber, selectVerse]);
  
  const retryVerse = useCallback(() => {
    // Just reset to beginning but don't auto-play
    resetAudio();
  }, [resetAudio]);
  
  // When verse or phase changes, don't auto-play audio, just make sure it's loaded
  useEffect(() => {
    if (currentVerse && audioElement) {
      // Reset audio to beginning when verse or phase changes
      resetAudio();
    }
  }, [currentPhase, currentVerse, audioElement, resetAudio]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    surahs,
    selectedSurah,
    selectedVerseNumber,
    currentVerse,
    currentPhase,
    loading,
    error,
    audioPlaying,
    audioElement,
    selectSurah,
    selectVerse,
    setPhase: setCurrentPhase,
    nextPhase,
    nextVerse,
    previousVerse,
    playAudio,
    pauseAudio,
    resetAudio,
    retryVerse
  }), [
    surahs, 
    selectedSurah, 
    selectedVerseNumber, 
    currentVerse, 
    currentPhase, 
    loading, 
    error, 
    audioPlaying, 
    audioElement,
    selectSurah, 
    selectVerse, 
    nextPhase, 
    nextVerse, 
    previousVerse, 
    playAudio, 
    pauseAudio, 
    resetAudio, 
    retryVerse
  ]);
  
  return (
    <MemorizationContext.Provider value={contextValue}>
      {children}
    </MemorizationContext.Provider>
  );
}

// Custom hook for accessing the memorization context
function useMemorization() {
  const context = useContext(MemorizationContext);
  if (context === undefined) {
    throw new Error('useMemorization must be used within a MemorizationProvider');
  }
  return context;
}

// Export the provider and hook
export { MemorizationProvider, useMemorization };