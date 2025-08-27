import express from 'express';
import QuizAttempt from '../models/QuizAttempt';
import Quiz from '../models/Quiz';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/leaderboard/global
// @desc    Global leaderboard (best attempt per user)
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const pipeline: any[] = [
      { $match: { isCompleted: true } },
      { $sort: { score: -1, percentage: -1, timeTaken: 1, completedAt: -1 } },
      { $group: {
          _id: '$user',
          attempt: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$attempt' } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
          _id: 1,
          userId: '$user._id',
          username: '$user.username',
          score: 1,
          percentage: 1,
          timeTaken: 1,
          quiz: 1,
          completedAt: 1
        }
      }
    ];

    const results = await QuizAttempt.aggregate(pipeline);
    return res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Global leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching leaderboard' });
  }
});

// @route   GET /api/leaderboard/quiz/:id
// @desc    Leaderboard for a specific quiz (top attempts)
// @access  Public
router.get('/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz id' });
    }

    const quiz = await Quiz.findById(id).select('title').lean();
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const pipeline: any[] = [
      { $match: { isCompleted: true, quiz: new mongoose.Types.ObjectId(id) } },
      { $sort: { score: -1, percentage: -1, timeTaken: 1, completedAt: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
          _id: 1,
          userId: '$user._id',
          username: '$user.username',
          score: 1,
          percentage: 1,
          timeTaken: 1,
          completedAt: 1
        }
      }
    ];

    const results = await QuizAttempt.aggregate(pipeline);
    return res.json({ success: true, data: { quiz, entries: results } });
  } catch (error: any) {
    console.error('Quiz leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching quiz leaderboard' });
  }
});

export default router;
