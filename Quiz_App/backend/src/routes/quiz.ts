import express from 'express';
import Quiz from '../models/Quiz';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/quiz
// @desc    Get all published quizzes (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query as any;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const query: any = { isPublished: true, isPublic: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex }
      ];
    }

    const totalQuizzes = await Quiz.countDocuments(query);
    const skip = (page - 1) * limit;
    const quizzes = await Quiz.find(query)
      .select('-questions.correctAnswer')
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalQuizzes < 1 ? 1 : totalQuizzes / limit),
          totalQuizzes,
          hasNext: skip + quizzes.length < totalQuizzes,
          hasPrev: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Get quizzes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes'
    });
  }
});

// @route   GET /api/quiz/my-quizzes
// @desc    Get user's own quizzes
// @access  Private
router.get('/my-quizzes', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    const quizzes = await Quiz.find({ author: userId });
    
    return res.json({
      success: true,
      data: quizzes
    });
  } catch (error: any) {
    console.error('Get my quizzes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your quizzes'
    });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get quiz by ID (public info only)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id).select('-questions.correctAnswer').lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!quiz.isPublished || !quiz.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not available'
      });
    }

    return res.json({
      success: true,
      data: quiz
    });
  } catch (error: any) {
    console.error('Get quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz'
    });
  }
});

// @route   POST /api/quiz
// @desc    Create a new quiz
// @access  Private
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category, difficulty, timeLimit, questions, tags } = req.body;
    
    // Basic validation
    if (!title || !description || !category || !difficulty || !timeLimit || !questions) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }
    
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must have at least one question'
      });
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText || !question.options || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is invalid`
        });
      }
      
      if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} has invalid correct answer index`
        });
      }
    }
    
    const newQuiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      timeLimit,
      questions,
      author: userId,
      tags: tags || [],
      isPublished: false,
      isPublic: true
    });
    
    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: newQuiz
    });
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating quiz'
    });
  }
});

// @route   PUT /api/quiz/:id
// @desc    Update a quiz
// @access  Private (owner only)
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own quizzes'
      });
    }
    
    // Don't allow updating if quiz is published and has attempts
    if (quiz.isPublished && quiz.totalAttempts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit published quiz that has attempts'
      });
    }
    
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, { new: true });
    
    return res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });
  } catch (error: any) {
    console.error('Update quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating quiz'
    });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz
// @access  Private (owner only)
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own quizzes'
      });
    }
    
    // Don't allow deletion if quiz has attempts
    if (quiz.totalAttempts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete quiz that has attempts'
      });
    }
    
    await Quiz.findByIdAndDelete(id);
    
    return res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz'
    });
  }
});

// @route   POST /api/quiz/:id/publish
// @desc    Publish/unpublish a quiz
// @access  Private (owner only)
router.post('/:id/publish', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { isPublished } = req.body;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own quizzes'
      });
    }
    
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, { isPublished }, { new: true });
    
    return res.json({
      success: true,
      message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: updatedQuiz
    });
  } catch (error: any) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while publishing quiz'
    });
  }
});

export default router;
