import express from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update basic profile
// @access  Private
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { username, avatar } = req.body;
    const update: any = {};
    if (typeof username === 'string' && username.trim()) update.username = username.trim();
    if (typeof avatar === 'string') update.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select('-password');
    return res.json({ success: true, data: user });
  } catch (e: any) {
    const msg = e?.message?.includes('duplicate') ? 'Username already taken' : 'Failed to update profile';
    return res.status(400).json({ success: false, message: msg });
  }
});

// @route   POST /api/user/badges
// @desc    Add a badge to current user
// @access  Private
router.post('/badges', authenticateToken, async (req: any, res) => {
  try {
    const { id, name, description, icon } = req.body || {};
    if (!id || !name) {
      return res.status(400).json({ success: false, message: 'Badge id and name are required' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const exists = user.badges?.some((b: any) => b.id === id);
    if (exists) {
      return res.json({ success: true, data: user });
    }
    user.badges.push({ id, name, description: description || '', icon: icon || '🏅', earnedAt: new Date() } as any);
    await user.save();
    return res.json({ success: true, data: user.toJSON() });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: 'Failed to add badge' });
  }
});

export default router;
