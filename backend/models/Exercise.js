const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Exercise name is required'], trim: true },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'hiit'],
    required: true
  },
  muscleGroup: {
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'glutes', 'calves'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  equipment: {
    type: String,
    enum: ['none', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'other'],
    default: 'none'
  },
  description: { type: String, default: '' },
  defaultSets: { type: Number, default: 3 },
  defaultReps: { type: Number, default: 10 },
  defaultDuration: { type: Number, default: 0 }, // minutes (for cardio)
  caloriesPerMinute: { type: Number, default: 5 }
});

exerciseSchema.index({ type: 1, difficulty: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
