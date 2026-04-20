const express = require('express');
const Log = require('../models/Log');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/logs/stats  (must be before /:id)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const allLogs = await Log.find({ userId }).sort({ date: -1 });

    const totalWorkouts = allLogs.length;
    const totalMinutes = allLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalCalories = allLogs.reduce((sum, l) => sum + (l.totalCaloriesBurned || 0), 0);
    const avgCompletion = totalWorkouts > 0
      ? Math.round(allLogs.reduce((sum, l) => sum + (l.completionRate || 0), 0) / totalWorkouts)
      : 0;

    const monthLogs = allLogs.filter(l => new Date(l.date) >= startOfMonth);
    const weekLogs = allLogs.filter(l => new Date(l.date) >= startOfWeek);

    // Streak calculation
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDates = [...new Set(allLogs.map(l => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }))].sort().reverse();

    for (let i = 0; i < logDates.length; i++) {
      const logDate = new Date(logDates[i]);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      expected.setHours(0, 0, 0, 0);
      if (logDate.toISOString() === expected.toISOString()) {
        streakDays++;
      } else {
        break;
      }
    }

    // Weekly volume (last 7 days)
    const weeklyVolume = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const dayLogs = allLogs.filter(l => {
        const ld = new Date(l.date);
        return ld >= day && ld < nextDay;
      });
      const minutes = dayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
      weeklyVolume.push({ day: days[day.getDay()], minutes, date: day.toISOString() });
    }

    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        avgCompletion,
        workoutsThisWeek: weekLogs.length,
        workoutsThisMonth: monthLogs.length,
        streakDays,
        weeklyVolume
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, planId, limit } = req.query;
    const filter = { userId: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (planId) filter.planId = planId;

    const query = Log.find(filter).sort({ date: -1 });
    if (limit) query.limit(Number(limit));

    const logs = await query;
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/logs
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { planId, planName, date, duration, exercisesCompleted, totalCaloriesBurned, notes, mood, completionRate } = req.body;

    if (!duration && duration !== 0) {
      return res.status(400).json({ success: false, error: 'Duration is required' });
    }

    const log = await Log.create({
      userId: req.user.id,
      planId, planName, date,
      duration: Number(duration),
      exercisesCompleted: exercisesCompleted || [],
      totalCaloriesBurned: totalCaloriesBurned || 0,
      notes, mood,
      completionRate: completionRate || 0
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/logs/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });

    const fields = ['planId', 'planName', 'date', 'duration', 'exercisesCompleted', 'totalCaloriesBurned', 'notes', 'mood', 'completionRate'];
    fields.forEach(f => { if (req.body[f] !== undefined) log[f] = req.body[f]; });

    await log.save();
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });
    res.json({ success: true, data: { message: 'Log deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
