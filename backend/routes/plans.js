const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/plans/templates  (must be before /:id)
router.get('/templates', async (req, res) => {
  try {
    const templates = await WorkoutPlan.find({ isTemplate: true, isPublic: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/plans
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, intensity, duration, sort } = req.query;
    const filter = { userId: req.user.id };

    if (type && type !== 'all') filter.type = type;
    if (intensity && intensity !== 'all') filter.intensity = intensity;
    if (duration) {
      if (duration === 'under30') filter.durationPerSession = { $lt: 30 };
      else if (duration === '30to45') filter.durationPerSession = { $gte: 30, $lte: 45 };
      else if (duration === '45to60') filter.durationPerSession = { $gte: 45, $lte: 60 };
      else if (duration === '60plus') filter.durationPerSession = { $gt: 60 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'az') sortOption = { name: 1 };
    else if (sort === 'duration') sortOption = { durationPerSession: 1 };

    const plans = await WorkoutPlan.find(filter).sort(sortOption);
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/plans
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, type, intensity, durationPerSession, daysPerWeek, goal, exercises, isTemplate, isPublic } = req.body;

    if (!name || !type || !intensity || !durationPerSession || !daysPerWeek) {
      return res.status(400).json({ success: false, error: 'name, type, intensity, durationPerSession, and daysPerWeek are required' });
    }

    const plan = await WorkoutPlan.create({
      userId: req.user.id,
      name, description, type, intensity,
      durationPerSession: Number(durationPerSession),
      daysPerWeek: Number(daysPerWeek),
      goal,
      exercises: exercises || [],
      isTemplate: isTemplate || false,
      isPublic: isPublic || false
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/plans/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/plans/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const fields = ['name', 'description', 'type', 'intensity', 'durationPerSession', 'daysPerWeek', 'goal', 'exercises', 'isTemplate', 'isPublic'];
    fields.forEach(f => { if (req.body[f] !== undefined) plan[f] = req.body[f]; });

    await plan.save();
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/plans/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: { message: 'Plan deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/plans/:id/clone
router.post('/:id/clone', authMiddleware, async (req, res) => {
  try {
    const original = await WorkoutPlan.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, error: 'Template not found' });

    const cloned = await WorkoutPlan.create({
      userId: req.user.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      intensity: original.intensity,
      durationPerSession: original.durationPerSession,
      daysPerWeek: original.daysPerWeek,
      goal: original.goal,
      exercises: original.exercises,
      isTemplate: false,
      isPublic: false
    });

    res.status(201).json({ success: true, data: cloned });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
