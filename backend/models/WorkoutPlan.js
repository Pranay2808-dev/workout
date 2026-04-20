const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Plan name is required'], trim: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'mixed', 'hiit'],
    required: true
  },
  intensity: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  durationPerSession: { type: Number, required: true, min: 5, max: 300 },
  daysPerWeek: { type: Number, required: true, min: 1, max: 7 },
  goal: { type: String, default: '' },
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    name: { type: String },
    sets: { type: Number, default: 3 },
    reps: { type: Number, default: 10 },
    duration: { type: Number, default: 0 },
    restSeconds: { type: Number, default: 60 },
    order: { type: Number, default: 0 }
  }],
  isTemplate: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

workoutPlanSchema.index({ userId: 1, type: 1 });
workoutPlanSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
