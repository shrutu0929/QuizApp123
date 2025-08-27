import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt extends Document {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: IAnswer[];
  questionsSnapshot?: ISnapshotQuestion[];
  score: number;
  totalPossibleScore: number;
  percentage: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  startedAt: Date;
  isCompleted: boolean;
  feedback: string;
  rank?: number; // position in leaderboard
}

export interface IAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number; // in seconds
  explanation?: string;
}

export interface ISnapshotQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
  timeLimit?: number;
}

const AnswerSchema = new Schema<IAnswer>({
  questionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  selectedOption: {
    type: Number,
    required: true,
    min: -1 // -1 means skipped/auto-timeout
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  }
});

const SnapshotQuestionSchema = new Schema<ISnapshotQuestion>({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  },
  points: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number
  }
}, { _id: false });

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: {
    type: [AnswerSchema],
    required: true
  },
  questionsSnapshot: {
    type: [SnapshotQuestionSchema],
    required: false,
    default: undefined
  },
  score: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalPossibleScore: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  },
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    enum: ['excellent', 'good', 'average', 'below_average', 'poor'],
    default: 'average'
  },
  rank: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate score and percentage
QuizAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    // Calculate total score
    this.score = this.answers.reduce((total, answer) => {
      return total + answer.pointsEarned;
    }, 0);

    // Calculate percentage
    if (this.totalPossibleScore > 0) {
      this.percentage = Math.round((this.score / this.totalPossibleScore) * 100);
    }

    // Calculate total time taken
    this.timeTaken = this.answers.reduce((total, answer) => {
      return total + answer.timeSpent;
    }, 0);

    // Set feedback based on percentage
    if (this.percentage >= 90) {
      this.feedback = 'excellent';
    } else if (this.percentage >= 80) {
      this.feedback = 'good';
    } else if (this.percentage >= 70) {
      this.feedback = 'average';
    } else if (this.percentage >= 60) {
      this.feedback = 'below_average';
    } else {
      this.feedback = 'poor';
    }
  }
  next();
});

// Indexes for better query performance
QuizAttemptSchema.index({ user: 1, quiz: 1 });
QuizAttemptSchema.index({ quiz: 1, score: -1 }); // For leaderboards
QuizAttemptSchema.index({ user: 1, completedAt: -1 }); // For user history
QuizAttemptSchema.index({ isCompleted: 1, completedAt: -1 });

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
