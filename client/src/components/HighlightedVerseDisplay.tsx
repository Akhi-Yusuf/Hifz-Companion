import React, { useState, useEffect, useRef } from 'react';
import { MemorizationPhase } from '../types';

interface HighlightedWordProps {
  word: string;
  isActive: boolean;
  index: number;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

const HighlightedWord: React.FC<HighlightedWordProps> = ({ 
  word, 
  isActive, 
  index,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <span 
      className={`inline-block transition-all duration-200 mx-1 p-1 rounded cursor-pointer ${
        isActive 
          ? 'bg-primary/20 text-primary font-bold dark:bg-primary/30 dark:text-primary-foreground scale-110 shadow-sm' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={onMouseLeave}
    >
      {word}
    </span>
  );
};

interface HighlightedVerseProps {
  text: string;
  audioElement: HTMLAudioElement | null;
  audioPlaying: boolean;
  phase: MemorizationPhase;
  translation?: string;
}

export const HighlightedVerseDisplay: React.FC<HighlightedVerseProps> = ({ 
  text, 
  audioElement,
  audioPlaying,
  phase,
  translation
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [hoverWordIndex, setHoverWordIndex] = useState<number>(-1);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timingRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split text into words
  useEffect(() => {
    if (text) {
      // We split by spaces, but preserve spaces within the words array
      const wordsArray = text.split(' ').filter(word => word.trim() !== '');
      setWords(wordsArray);
      setActiveWordIndex(-1);
      setHoverWordIndex(-1);
    }
  }, [text]);

  // Handle word highlighting based on audio current time
  useEffect(() => {
    if (!audioElement || !audioPlaying || words.length === 0 || 
        phase !== MemorizationPhase.TextWithAudio) {
      // Clear the active word if audio is not playing
      if (!audioPlaying) {
        setActiveWordIndex(-1);
      }
      return;
    }

    // Clear any existing interval
    if (timingRef.current) {
      clearInterval(timingRef.current);
    }

    // Get total audio duration
    const totalDuration = audioElement.duration || 0;
    
    // Use a weighted approach for timing based on word length
    const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
    const characterTimeFactor = totalDuration / totalCharacters;
    
    // Create timing map for words
    const wordTimings: number[] = [];
    let accumulatedTime = 0;
    
    // Compute start times for each word based on its length
    words.forEach((word, index) => {
      wordTimings[index] = accumulatedTime;
      // Each word gets time proportional to its length plus a small fixed time
      const wordTime = (word.length * characterTimeFactor) + 0.15; // 0.15s fixed time per word
      accumulatedTime += wordTime;
    });
    
    // Scale timing map to match actual audio duration with a small initial delay
    const initialDelay = 0.5; // Half second initial delay
    const scaleFactor = (totalDuration - initialDelay) / accumulatedTime;
    wordTimings.forEach((time, index) => {
      wordTimings[index] = (time * scaleFactor) + initialDelay;
    });
    
    // Function to update active word based on current time
    const updateActiveWord = () => {
      if (!audioElement || !audioPlaying) return;

      const currentTime = audioElement.currentTime;
      
      // Find the current word based on timing
      let newActiveIndex = -1;
      for (let i = words.length - 1; i >= 0; i--) {
        if (currentTime >= wordTimings[i]) {
          newActiveIndex = i;
          
          // Check if we're already past this word's time slot
          const nextWordTime = i < words.length - 1 ? wordTimings[i+1] : totalDuration;
          if (currentTime >= nextWordTime) {
            newActiveIndex = i+1 < words.length ? i+1 : words.length - 1;
          }
          break;
        }
      }
      
      // Only update if it's different to avoid unnecessary re-renders
      if (newActiveIndex !== activeWordIndex && newActiveIndex < words.length) {
        setActiveWordIndex(newActiveIndex);
      }
    };

    // Set initial active word
    updateActiveWord();

    // Set up interval to update the active word
    timingRef.current = setInterval(updateActiveWord, 100);

    // Add event listener for audio ended
    const handleEnded = () => {
      setActiveWordIndex(-1);
    };
    audioElement.addEventListener('ended', handleEnded);

    // Clean up
    return () => {
      if (timingRef.current) {
        clearInterval(timingRef.current);
      }
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, audioPlaying, words, activeWordIndex, phase]);

  // Reset active word when audio ends or is reset
  useEffect(() => {
    if (!audioPlaying) {
      setActiveWordIndex(-1);
    }
  }, [audioPlaying]);

  const handleWordHover = (index: number) => {
    setHoverWordIndex(index);
  };

  const handleWordLeave = () => {
    setHoverWordIndex(-1);
  };

  // Generate simplified translation excerpt for hover tooltip
  const getWordTranslation = (index: number): string => {
    if (!translation) return "";
    
    // For Arabic to English word mapping, we'll do a simple approach:
    // Show a small segment of the translation based on the word position
    const words = translation.split(' ');
    const totalWords = words.length;
    const arabicWords = text.split(' ').filter(w => w.trim() !== '').length;
    
    // Calculate approximate position in English translation
    const segmentSize = Math.ceil(totalWords / arabicWords);
    const startPos = Math.min(index * segmentSize, totalWords - segmentSize);
    const endPos = Math.min(startPos + segmentSize, totalWords);
    
    return words.slice(startPos, endPos).join(' ');
  };

  if (words.length === 0) {
    return null;
  }

  return (
    <div 
      className="arabic-text text-right text-2xl mb-4 leading-loose relative" 
      dir="rtl"
      ref={containerRef}
    >
      {words.map((word, index) => (
        <HighlightedWord
          key={index}
          word={word}
          isActive={index === activeWordIndex}
          index={index}
          onMouseEnter={handleWordHover}
          onMouseLeave={handleWordLeave}
        />
      ))}
      
      {/* Hover Translation Tooltip */}
      {hoverWordIndex >= 0 && (
        <div 
          className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-sm text-left max-w-xs transition-opacity z-50"
          style={{
            top: '100%',
            right: '50%',
            transform: 'translateX(50%)',
            direction: 'ltr'
          }}
        >
          <p className="text-gray-700 dark:text-gray-300">
            {getWordTranslation(hoverWordIndex)}
          </p>
        </div>
      )}
    </div>
  );
};