export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'player';
  avatar?: string;
  joinDate: Date;
  totalQuizzesAttempted: number;
  averageScore: number;
  highestScore: number;
  badges: Badge[];
  level: number;
  experience: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  timeLimit: number; // in minutes
  createdBy: string;
  createdAt: Date;
  isPublished: boolean;
  totalAttempts: number;
  averageScore: number;
}

export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number | number[]; // single or multiple correct answers
  timeLimit?: number; // per question time limit in seconds
  points: number;
}

export interface QuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  quiz: Quiz;
}

export interface Answer {
  questionId: string;
  selectedOptions: number[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  quizId?: string;
  category?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
