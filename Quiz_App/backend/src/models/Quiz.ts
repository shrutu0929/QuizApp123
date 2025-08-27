import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  questions: IQuestion[];
  author: mongoose.Types.ObjectId;
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

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points: number;
  timeLimit?: number; // individual question time limit
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options: string[]) {
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Questions must have between 2 and 6 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  timeLimit: {
    type: Number,
    min: 10 // minimum 10 seconds per question
  }
});

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
    max: 180 // maximum 3 hours
  },
  questions: {
    type: [QuestionSchema],
    required: true,
    validate: {
      validator: function(questions: IQuestion[]) {
        return questions.length >= 1 && questions.length <= 100;
      },
      message: 'Quiz must have between 1 and 100 questions'
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: {
    type: [String],
    default: []
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
QuizSchema.pre('save', function(next) {
  if (this.questions) {
    this.totalQuestions = this.questions.length;
    this.totalTime = this.questions.reduce((total, question) => {
      return total + (question.timeLimit || 0);
    }, 0);
  }
  next();
});

// Index for better query performance
QuizSchema.index({ author: 1, isPublished: 1 });
QuizSchema.index({ category: 1, difficulty: 1, isPublic: 1 });
QuizSchema.index({ tags: 1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
