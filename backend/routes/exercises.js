const express = require('express');
const Exercise = require('../models/Exercise');
const router = express.Router();

// GET /api/exercises
router.get('/', async (req, res) => {
  try {
    const { type, muscleGroup, difficulty, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (muscleGroup) filter.muscleGroup = muscleGroup;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const exercises = await Exercise.find(filter).sort({ type: 1, name: 1 });
    res.json({ success: true, data: exercises });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, error: 'Exercise not found' });
    res.json({ success: true, data: exercise });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
