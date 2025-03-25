import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { insertProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quran API proxy routes
  // Proxying external API requests to avoid CORS issues
  
  // Fetch list of all Surahs
  app.get("/api/quran/surahs", async (req, res) => {
    try {
      const response = await axios.get("https://api.alquran.cloud/v1/surah");
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching surahs:", error);
      res.status(500).json({ message: "Failed to fetch surahs" });
    }
  });

  // Fetch a specific Surah with verses and translations
  app.get("/api/quran/surah/:surahId", async (req, res) => {
    try {
      const surahId = req.params.surahId;
      // Fetch Arabic Surah
      const arabicResponse = await axios.get(`https://api.alquran.cloud/v1/surah/${surahId}`);
      
      // Fetch English Translation
      const translationResponse = await axios.get(
        `https://api.alquran.cloud/v1/surah/${surahId}/en.asad`
      );
      
      // Combine the data
      if (arabicResponse.data?.data && translationResponse.data?.data) {
        const surahData = arabicResponse.data.data;
        const translatedAyahs = translationResponse.data.data.ayahs;
        
        // Add translation to each ayah
        if (surahData.ayahs && translatedAyahs && 
            surahData.ayahs.length === translatedAyahs.length) {
          
          surahData.ayahs = surahData.ayahs.map((ayah: any, index: number) => {
            return {
              ...ayah,
              translation: translatedAyahs[index].text
            };
          });
        }
        
        res.json({
          code: arabicResponse.data.code,
          status: arabicResponse.data.status,
          data: surahData
        });
      } else {
        throw new Error("Failed to fetch surah data or translations");
      }
    } catch (error) {
      console.error("Error fetching surah:", error);
      res.status(500).json({ message: "Failed to fetch surah details" });
    }
  });

  // Fetch a specific verse with translation
  app.get("/api/quran/verse/:surahId/:verseNumber", async (req, res) => {
    try {
      const { surahId, verseNumber } = req.params;
      // Fetch the Arabic verse
      const arabicResponse = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${surahId}:${verseNumber}`
      );
      
      // Fetch English translation (using edition en.asad for Muhammad Asad's translation)
      const translationResponse = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${surahId}:${verseNumber}/en.asad`
      );
      
      // Combine the data
      if (arabicResponse.data && arabicResponse.data.data && 
          translationResponse.data && translationResponse.data.data) {
        
        const verseData = arabicResponse.data.data;
        verseData.translation = translationResponse.data.data.text;
        
        res.json({
          code: arabicResponse.data.code,
          status: arabicResponse.data.status,
          data: verseData
        });
      } else {
        throw new Error("Failed to fetch verse data or translation");
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      res.status(500).json({ message: "Failed to fetch verse details" });
    }
  });

  // Proxy for audio
  app.get("/api/quran/audio/:surahId/:verseNumber", async (req, res) => {
    try {
      const { surahId, verseNumber } = req.params;
      // First, get the audio URL from the API
      const response = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${surahId}:${verseNumber}/ar.alafasy`
      );
      
      if (response.data && response.data.data && response.data.data.audio) {
        // Redirect to the actual audio URL
        return res.redirect(response.data.data.audio);
      } else {
        throw new Error("Audio URL not found in response");
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
      res.status(500).json({ message: "Failed to fetch audio" });
    }
  });

  // Progress tracking API routes
  app.get("/api/progress/:userId/:surahId/:verseNumber", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const surahId = parseInt(req.params.surahId);
      const verseNumber = parseInt(req.params.verseNumber);
      
      const progress = await storage.getProgress(userId, surahId, verseNumber);
      if (progress) {
        res.json(progress);
      } else {
        res.status(404).json({ message: "Progress not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressSchema = insertProgressSchema.safeParse(req.body);
      
      if (!progressSchema.success) {
        return res.status(400).json({ message: "Invalid progress data", errors: progressSchema.error });
      }
      
      const newProgress = await storage.updateProgress({
        ...progressSchema.data,
        lastAccessed: new Date().toISOString()
      });
      
      res.status(201).json(newProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get("/api/progress/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressList = await storage.getAllProgressForUser(userId);
      res.json(progressList);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
