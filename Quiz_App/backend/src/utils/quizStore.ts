import { IQuestion } from '../models/Quiz';

interface MockQuiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  questions: IQuestion[];
  author: string;
  isPublished: boolean;
  isPublic: boolean;
  tags: string[];
  totalQuestions: number;
  totalTime: number;
  averageScore: number;
  totalAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateQuizData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  questions: IQuestion[];
  author: string;
  tags: string[];
  isPublished: boolean;
  isPublic: boolean;
}

class QuizStore {
  private quizzes: Map<string, MockQuiz> = new Map();
  private quizCounter = 1;

  constructor() {
    // Add some sample quizzes
    this.addSampleQuizzes();
  }

  private addSampleQuizzes() {
    const sampleQuizzes: MockQuiz[] = [
      {
        _id: 'quiz-1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
        category: 'Programming',
        difficulty: 'easy',
        timeLimit: 15,
        questions: [
          {
            questionText: 'What is the correct way to declare a variable in JavaScript?',
            options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
            correctAnswer: 0,
            explanation: 'var is the traditional way to declare variables in JavaScript',
            points: 1,
            timeLimit: 30
          },
          {
            questionText: 'Which method is used to add an element to the end of an array?',
            options: ['push()', 'pop()', 'shift()', 'unshift()'],
            correctAnswer: 0,
            explanation: 'push() adds elements to the end of an array',
            points: 1,
            timeLimit: 30
          }
        ],
        author: 'user-1',
        isPublished: true,
        isPublic: true,
        tags: ['javascript', 'programming', 'basics'],
        totalQuestions: 2,
        totalTime: 60,
        averageScore: 0,
        totalAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'quiz-2',
        title: 'General Knowledge',
        description: 'A mix of interesting facts from various fields including science, history, and geography.',
        category: 'General Knowledge',
        difficulty: 'medium',
        timeLimit: 20,
        questions: [
          {
            questionText: 'What is the capital of Australia?',
            options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
            correctAnswer: 2,
            explanation: 'Canberra is the capital city of Australia',
            points: 1,
            timeLimit: 30
          },
          {
            questionText: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 1,
            explanation: 'Mars is called the Red Planet due to iron oxide on its surface',
            points: 1,
            timeLimit: 30
          }
        ],
        author: 'user-1',
        isPublished: true,
        isPublic: true,
        tags: ['general', 'geography', 'science'],
        totalQuestions: 2,
        totalTime: 60,
        averageScore: 0,
        totalAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleQuizzes.forEach(quiz => {
      this.quizzes.set(quiz._id, quiz);
      this.quizCounter = Math.max(this.quizCounter, parseInt(quiz._id.split('-')[1]) + 1);
    });
  }

  // Get all published quizzes
  async getAllPublishedQuizzes(filters: any = {}) {
    let filteredQuizzes = Array.from(this.quizzes.values()).filter(quiz => 
      quiz.isPublished && quiz.isPublic
    );

    // Apply filters
    if (filters.category) {
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.difficulty === filters.difficulty
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) ||
        quiz.description.toLowerCase().includes(searchTerm) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filteredQuizzes;
  }

  // Get quiz by ID
  async getQuizById(id: string) {
    return this.quizzes.get(id) || null;
  }

  // Get quizzes by author
  async getQuizzesByAuthor(authorId: string) {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.author === authorId);
  }

  // Create new quiz
  async createQuiz(quizData: CreateQuizData) {
    const newQuiz: MockQuiz = {
      ...quizData,
      _id: `quiz-${this.quizCounter++}`,
      totalQuestions: quizData.questions.length,
      totalTime: quizData.questions.reduce((total, q) => total + (q.timeLimit || 0), 0),
      averageScore: 0,
      totalAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.quizzes.set(newQuiz._id, newQuiz);
    return newQuiz;
  }

  // Update quiz
  async updateQuiz(id: string, updateData: Partial<MockQuiz>) {
    const quiz = this.quizzes.get(id);
    if (!quiz) return null;

    const updatedQuiz = { ...quiz, ...updateData, updatedAt: new Date() };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  // Delete quiz
  async deleteQuiz(id: string) {
    return this.quizzes.delete(id);
  }

  // Get all quizzes (for debugging)
  async getAllQuizzes() {
    return Array.from(this.quizzes.values());
  }

  // Clear all quizzes (for testing)
  async clearAll() {
    this.quizzes.clear();
    this.quizCounter = 1;
    this.addSampleQuizzes();
  }
}

export default new QuizStore();
