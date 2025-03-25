// Core types for the Quran memorization tool

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Verse {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  audio: string;
  audioSecondary: string[];
  translation: string;
}

export interface Progress {
  id: number;
  userId: number;
  surahId: number;
  verseNumber: number;
  phase: number;
  completed: boolean;
  lastAccessed: string;
}

export enum MemorizationPhase {
  TextWithAudio = 1,
  TextWithoutAudio = 2,
  TextWithHoles = 3,
  EmptyWithAudio = 4,
  CompleteMemorization = 5
}
