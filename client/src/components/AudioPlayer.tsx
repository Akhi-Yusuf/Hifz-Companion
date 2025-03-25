import React, { useState, useEffect, useCallback } from 'react';
import { useMemorization } from '../context/MemorizationContext';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function AudioPlayer() {
  const { currentVerse, audioPlaying, playAudio, pauseAudio, resetAudio, audioElement } = useMemorization();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  
  // Create the update progress callback that will not cause rerenders
  const updateProgress = useCallback(() => {
    if (!audioElement) return;
    
    try {
      const percent = (audioElement.currentTime / audioElement.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
      
      // Update current time
      const minutes = Math.floor(audioElement.currentTime / 60);
      const seconds = Math.floor(audioElement.currentTime % 60);
      setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  }, [audioElement]);
  
  // Set duration data when metadata is loaded
  const setDurationData = useCallback(() => {
    if (!audioElement) return;
    
    try {
      const minutes = Math.floor(audioElement.duration / 60);
      const seconds = Math.floor(audioElement.duration % 60);
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } catch (err) {
      console.error("Error setting duration:", err);
    }
  }, [audioElement]);
  
  // Handle audio ending
  const handleEnded = useCallback(() => {
    setProgress(0);
    pauseAudio();
  }, [pauseAudio]);
  
  // Setup event listeners when audio element changes
  useEffect(() => {
    if (!audioElement) return;
    
    // Setup event listeners
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', setDurationData);
    audioElement.addEventListener('ended', handleEnded);
    
    // Initially try to set duration if already loaded
    if (audioElement.duration) {
      setDurationData();
    }
    
    // Clean up
    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('loadedmetadata', setDurationData);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, updateProgress, setDurationData, handleEnded]);
  
  const handlePlay = () => {
    if (audioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };
  
  if (!currentVerse) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
        <div className="text-center w-full text-gray-500 dark:text-gray-300">
          No audio available
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center space-x-3">
        <button 
          onClick={handlePlay}
          className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-700 text-white rounded-full focus:outline-none"
        >
          {audioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button 
          onClick={resetAudio}
          className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 mx-4">
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <span>{currentTime}</span> / <span>{duration}</span>
      </div>
    </div>
  );
}
