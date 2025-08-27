import { IAnswer } from '../models/QuizAttempt';

interface MockAttempt {
  _id: string;
  user: string;
  quiz: string;
  answers: IAnswer[];
  score: number;
  totalPossibleScore: number;
  percentage: number;
  timeTaken: number;
  completedAt?: Date;
  startedAt: Date;
  isCompleted: boolean;
  feedback: string;
  rank?: number;
}

interface CreateAttemptData {
  user: string;
  quiz: string;
  answers: IAnswer[];
  score: number;
  totalPossibleScore: number;
  timeTaken: number;
  startedAt: Date;
  isCompleted: boolean;
}

class AttemptStore {
  private attempts: Map<string, MockAttempt> = new Map();
  private attemptCounter = 1;

  // Create new attempt
  async createAttempt(attemptData: CreateAttemptData) {
    const newAttempt: MockAttempt = {
      ...attemptData,
      _id: `attempt-${this.attemptCounter++}`,
      percentage: 0,
      completedAt: undefined,
      feedback: 'average',
      rank: undefined
    };

    this.attempts.set(newAttempt._id, newAttempt);
    return newAttempt;
  }

  // Get attempt by ID
  async getAttemptById(id: string) {
    return this.attempts.get(id) || null;
  }

  // Get attempts by user
  async getAttemptsByUser(userId: string) {
    return Array.from(this.attempts.values()).filter(attempt => attempt.user === userId);
  }

  // Update attempt
  async updateAttempt(id: string, updateData: Partial<MockAttempt>) {
    const attempt = this.attempts.get(id);
    if (!attempt) return null;

    const updatedAttempt = { ...attempt, ...updateData };
    this.attempts.set(id, updatedAttempt);
    return updatedAttempt;
  }

  // Get all attempts (for debugging)
  async getAllAttempts() {
    return Array.from(this.attempts.values());
  }

  // Clear all attempts (for testing)
  async clearAll() {
    this.attempts.clear();
    this.attemptCounter = 1;
  }
}

export default new AttemptStore();
