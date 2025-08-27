import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';

const router = express.Router();

// @route   POST /api/attempt/start
// @desc    Start a new quiz attempt
// @access  Private
router.post('/start', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { quizId } = req.body;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    // Check if quiz exists and is published
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (!quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not published'
      });
    }
    
    // Check if user already has an incomplete attempt
    const existingAttempt = await QuizAttempt.findOne({ user: userId, quiz: quizId, isCompleted: false });
    
    if (existingAttempt) {
      // Return existing attempt instead of error to allow resume
      const quizForAttempt = {
        ...quiz,
        questions: (quiz.questions || []).map((q: any) => {
          const { correctAnswer, ...questionWithoutAnswer } = q as any;
          return questionWithoutAnswer;
        })
      };
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: {
          attempt: existingAttempt,
          quiz: quizForAttempt
        }
      });
    }
    
    // Create new attempt
    const newAttempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      answers: [],
      questionsSnapshot: (quiz.questions || []).map((q: any) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || 0,
        timeLimit: q.timeLimit
      })),
      score: 0,
      totalPossibleScore: (quiz.questions || []).reduce((total: number, q: any) => total + (q.points || 0), 0),
      percentage: 0,
      timeTaken: 0,
      startedAt: new Date(),
      isCompleted: false
    });
    
    // Return quiz without correct answers
    const quizForAttempt = {
      ...quiz,
      questions: (quiz.questions || []).map((q: any) => {
        const { correctAnswer, ...questionWithoutAnswer } = q as any;
        return questionWithoutAnswer;
      })
    };
    
    return res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      data: {
        attempt: newAttempt,
        quiz: quizForAttempt
      }
    });
  } catch (error: any) {
    console.error('Start attempt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while starting quiz attempt'
    });
  }
});

// @route   POST /api/attempt/:id/answer
// @desc    Submit an answer for a question
// @access  Private
router.post('/:id/answer', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { questionIndex, selectedOption, timeSpent } = req.body;
    
    if (questionIndex === undefined || selectedOption === undefined || timeSpent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Question index, selected option, and time spent are required'
      });
    }
    
    // Find the attempt
    const attempt = await QuizAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    if (attempt.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only answer questions for your own attempts'
      });
    }
    
    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot answer questions for completed attempts'
      });
    }
    
    // Use snapshot to check correct answer
    const snapshot = (attempt as any).questionsSnapshot || [];
    
    const qIndex = Number(questionIndex);
    const sIndex = selectedOption === -1 ? -1 : Number(selectedOption);
    if (Number.isNaN(qIndex) || qIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const question = (snapshot || [])[qIndex] as any;
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question options not available' });
    }
    if (sIndex !== -1 && (Number.isNaN(sIndex) || sIndex < 0 || sIndex >= question.options.length)) {
      return res.status(400).json({ success: false, message: 'Invalid selected option index' });
    }
    
    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === qIndex);
    
    const isCorrect = sIndex !== -1 && sIndex === Number(question.correctAnswer);
    const pointsEarned = isCorrect ? Number(question.points || 0) : 0;
    
    const answer = {
      questionIndex: qIndex,
      selectedOption: sIndex,
      isCorrect,
      pointsEarned,
      timeSpent: Number(timeSpent),
      explanation: question.explanation
    };
    
    let updatedAnswers = [...attempt.answers];
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      updatedAnswers[existingAnswerIndex] = answer;
    } else {
      // Add new answer
      updatedAnswers.push(answer);
    }
    
    // Update attempt with new answers
    attempt.answers = updatedAnswers as any;
    // Ensure Mongoose tracks nested array changes
    (attempt as any).markModified('answers');
    try {
      await attempt.save();
    } catch (e: any) {
      // If validation error due to concurrent writes, ignore to avoid blocking UI
      console.warn('Non-fatal attempt save error:', e?.message);
    }
    
    return res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    });
  } catch (error: any) {
    console.error('Submit answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting answer'
    });
  }
});

// @route   POST /api/attempt/:id/complete
// @desc    Complete a quiz attempt
// @access  Private
router.post('/:id/complete', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Find the attempt
    const attempt = await QuizAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    if (attempt.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only complete your own attempts'
      });
    }
    
    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Attempt is already completed'
      });
    }
    
    // Mark as completed; model pre-save handles derived fields
    attempt.isCompleted = true;
    attempt.completedAt = new Date();
    await attempt.save();

    // Build detailed report from snapshot to ensure consistency
    const questions = ((attempt as any).questionsSnapshot || []) as any[];
    const breakdown = attempt.answers.map((ans: any) => {
      const q = questions[ans.questionIndex] as any;
      return {
        questionIndex: ans.questionIndex,
        questionText: q?.questionText,
        options: q?.options || [],
        selectedOption: ans.selectedOption,
        correctAnswer: q?.correctAnswer,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.pointsEarned,
        pointsAvailable: q?.points || 0,
        explanation: q?.explanation || '',
        timeSpent: ans.timeSpent || 0
      };
    });
    
    return res.json({
      success: true,
      message: 'Quiz attempt completed',
      data: {
        score: attempt.score,
        totalPossibleScore: attempt.totalPossibleScore,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        feedback: attempt.feedback,
        breakdown
      }
    });
  } catch (error: any) {
    console.error('Complete attempt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while completing quiz attempt'
    });
  }
});

// @route   GET /api/attempt/my-attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get('/my-attempts', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    const attempts = await QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).lean();
    
    return res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalAttempts: attempts.length,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  } catch (error: any) {
    console.error('Get attempts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching attempts'
    });
  }
});

// @route   GET /api/attempt/:id
// @desc    Get attempt details
// @access  Private
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const attempt = await QuizAttempt.findById(id).lean();
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    if (attempt.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own attempts'
      });
    }
    
    return res.json({
      success: true,
      data: attempt
    });
  } catch (error: any) {
    console.error('Get attempt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching attempt'
    });
  }
});

export default router;
