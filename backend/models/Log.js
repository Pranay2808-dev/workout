const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  planName: { type: String, default: 'Custom Workout' },
  date: { type: Date, required: true, default: Date.now },
  duration: { type: Number, default: 0 }, // actual minutes completed
  exercisesCompleted: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    name: { type: String },
    sets: [{
      reps: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      completed: { type: Boolean, default: false }
    }]
  }],
  totalCaloriesBurned: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'bad'],
    default: 'good'
  },
  completionRate: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

logSchema.index({ userId: 1, date: -1 });
logSchema.index({ userId: 1, planId: 1 });

module.exports = mongoose.model('Log', logSchema);
