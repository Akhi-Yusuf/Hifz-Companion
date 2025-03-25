import { users, type User, type InsertUser, progress, type Progress, type InsertProgress } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Progress tracking methods
  getProgress(userId: number, surahId: number, verseNumber: number): Promise<Progress | undefined>;
  updateProgress(progressData: InsertProgress): Promise<Progress>;
  getAllProgressForUser(userId: number): Promise<Progress[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progresses: Map<string, Progress>;
  currentUserId: number;
  currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.progresses = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProgress(userId: number, surahId: number, verseNumber: number): Promise<Progress | undefined> {
    const key = `${userId}-${surahId}-${verseNumber}`;
    return this.progresses.get(key);
  }

  async updateProgress(progressData: InsertProgress): Promise<Progress> {
    const key = `${progressData.userId}-${progressData.surahId}-${progressData.verseNumber}`;
    const existingProgress = this.progresses.get(key);
    
    if (existingProgress) {
      // Create a properly typed update
      const updatedProgress: Progress = {
        ...existingProgress,
        phase: progressData.phase,
        completed: progressData.completed === undefined ? existingProgress.completed : progressData.completed,
        lastAccessed: progressData.lastAccessed
      };
      this.progresses.set(key, updatedProgress);
      return updatedProgress;
    } else {
      const newId = this.currentProgressId++;
      // Create a properly typed new progress with all required fields
      const newProgress: Progress = {
        id: newId,
        userId: progressData.userId === undefined ? null : progressData.userId,
        surahId: progressData.surahId,
        verseNumber: progressData.verseNumber,
        phase: progressData.phase,
        completed: progressData.completed === undefined ? false : progressData.completed,
        lastAccessed: progressData.lastAccessed
      };
      this.progresses.set(key, newProgress);
      return newProgress;
    }
  }

  async getAllProgressForUser(userId: number): Promise<Progress[]> {
    return Array.from(this.progresses.values()).filter(
      (progress) => progress.userId === userId
    );
  }
}

export const storage = new MemStorage();
