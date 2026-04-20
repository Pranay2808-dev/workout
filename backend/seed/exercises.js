require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

const exercises = [
  // ── STRENGTH (10) ──
  {
    name: 'Bench Press', type: 'strength', muscleGroup: 'chest',
    difficulty: 'intermediate', equipment: 'barbell',
    description: 'Lie on a flat bench and press a barbell upward from chest height.',
    defaultSets: 4, defaultReps: 8, defaultDuration: 0, caloriesPerMinute: 6
  },
  {
    name: 'Back Squat', type: 'strength', muscleGroup: 'legs',
    difficulty: 'intermediate', equipment: 'barbell',
    description: 'Barbell on upper back, squat down until thighs are parallel to floor.',
    defaultSets: 4, defaultReps: 8, defaultDuration: 0, caloriesPerMinute: 7
  },
  {
    name: 'Deadlift', type: 'strength', muscleGroup: 'back',
    difficulty: 'advanced', equipment: 'barbell',
    description: 'Hinge at hips and lift a barbell from the floor to hip height.',
    defaultSets: 3, defaultReps: 5, defaultDuration: 0, caloriesPerMinute: 8
  },
  {
    name: 'Overhead Press', type: 'strength', muscleGroup: 'shoulders',
    difficulty: 'intermediate', equipment: 'barbell',
    description: 'Press a barbell from shoulder height to full arm extension overhead.',
    defaultSets: 4, defaultReps: 8, defaultDuration: 0, caloriesPerMinute: 5
  },
  {
    name: 'Pull-Up', type: 'strength', muscleGroup: 'back',
    difficulty: 'intermediate', equipment: 'bodyweight',
    description: 'Hang from a bar and pull your body upward until chin clears the bar.',
    defaultSets: 3, defaultReps: 8, defaultDuration: 0, caloriesPerMinute: 6
  },
  {
    name: 'Barbell Row', type: 'strength', muscleGroup: 'back',
    difficulty: 'intermediate', equipment: 'barbell',
    description: 'Hinge forward and pull a barbell toward your lower chest.',
    defaultSets: 4, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 6
  },
  {
    name: 'Lunges', type: 'strength', muscleGroup: 'legs',
    difficulty: 'beginner', equipment: 'bodyweight',
    description: 'Step forward into a lunge, lowering back knee toward the floor.',
    defaultSets: 3, defaultReps: 12, defaultDuration: 0, caloriesPerMinute: 5
  },
  {
    name: 'Romanian Deadlift', type: 'strength', muscleGroup: 'legs',
    difficulty: 'intermediate', equipment: 'barbell',
    description: 'Hip hinge with slight knee bend to work hamstrings and glutes.',
    defaultSets: 3, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 6
  },
  {
    name: 'Dips', type: 'strength', muscleGroup: 'chest',
    difficulty: 'intermediate', equipment: 'bodyweight',
    description: 'Lower body between parallel bars until shoulders are below elbows.',
    defaultSets: 3, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 6
  },
  {
    name: 'Bicep Curl', type: 'strength', muscleGroup: 'arms',
    difficulty: 'beginner', equipment: 'dumbbell',
    description: 'Curl dumbbells from hip height to shoulder height with controlled motion.',
    defaultSets: 3, defaultReps: 12, defaultDuration: 0, caloriesPerMinute: 4
  },

  // ── CARDIO (8) ──
  {
    name: 'Treadmill Run', type: 'cardio', muscleGroup: 'legs',
    difficulty: 'beginner', equipment: 'machine',
    description: 'Steady-state running on a treadmill at moderate pace.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 30, caloriesPerMinute: 10
  },
  {
    name: 'Cycling', type: 'cardio', muscleGroup: 'legs',
    difficulty: 'beginner', equipment: 'machine',
    description: 'Stationary or outdoor cycling at a consistent pace.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 30, caloriesPerMinute: 9
  },
  {
    name: 'Jump Rope', type: 'cardio', muscleGroup: 'full_body',
    difficulty: 'beginner', equipment: 'other',
    description: 'Continuous skipping rope at a steady rhythm.',
    defaultSets: 3, defaultReps: 0, defaultDuration: 5, caloriesPerMinute: 12
  },
  {
    name: 'Rowing Machine', type: 'cardio', muscleGroup: 'full_body',
    difficulty: 'beginner', equipment: 'machine',
    description: 'Full-body rowing motion targeting back, legs, and core.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 20, caloriesPerMinute: 11
  },
  {
    name: 'Stair Climber', type: 'cardio', muscleGroup: 'legs',
    difficulty: 'intermediate', equipment: 'machine',
    description: 'Simulated stair climbing for lower body and cardiovascular conditioning.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 20, caloriesPerMinute: 9
  },
  {
    name: 'Elliptical Trainer', type: 'cardio', muscleGroup: 'full_body',
    difficulty: 'beginner', equipment: 'machine',
    description: 'Low-impact elliptical movement engaging legs and arms.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 30, caloriesPerMinute: 8
  },
  {
    name: 'Swimming', type: 'cardio', muscleGroup: 'full_body',
    difficulty: 'intermediate', equipment: 'other',
    description: 'Freestyle or mixed swimming laps for full-body cardio.',
    defaultSets: 1, defaultReps: 0, defaultDuration: 30, caloriesPerMinute: 11
  },
  {
    name: 'Burpees', type: 'cardio', muscleGroup: 'full_body',
    difficulty: 'intermediate', equipment: 'none',
    description: 'Full-body explosive movement: squat, plank, push-up, jump.',
    defaultSets: 3, defaultReps: 15, defaultDuration: 0, caloriesPerMinute: 13
  },

  // ── HIIT (6) ──
  {
    name: 'Box Jumps', type: 'hiit', muscleGroup: 'legs',
    difficulty: 'intermediate', equipment: 'other',
    description: 'Explosively jump onto a raised box, land softly, step down.',
    defaultSets: 4, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 12
  },
  {
    name: 'Mountain Climbers', type: 'hiit', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'Drive knees alternately toward chest in plank position rapidly.',
    defaultSets: 3, defaultReps: 0, defaultDuration: 1, caloriesPerMinute: 11
  },
  {
    name: 'Kettlebell Swings', type: 'hiit', muscleGroup: 'full_body',
    difficulty: 'intermediate', equipment: 'kettlebell',
    description: 'Hip-hinge swing a kettlebell to chest height using explosive hip drive.',
    defaultSets: 4, defaultReps: 15, defaultDuration: 0, caloriesPerMinute: 13
  },
  {
    name: 'Battle Ropes', type: 'hiit', muscleGroup: 'arms',
    difficulty: 'intermediate', equipment: 'other',
    description: 'Alternate or simultaneous waves with heavy ropes for conditioning.',
    defaultSets: 4, defaultReps: 0, defaultDuration: 1, caloriesPerMinute: 14
  },
  {
    name: 'Sled Push', type: 'hiit', muscleGroup: 'legs',
    difficulty: 'advanced', equipment: 'other',
    description: 'Drive a weighted sled across the floor using leg and hip power.',
    defaultSets: 4, defaultReps: 0, defaultDuration: 1, caloriesPerMinute: 15
  },
  {
    name: 'Plyometric Push-Ups', type: 'hiit', muscleGroup: 'chest',
    difficulty: 'advanced', equipment: 'none',
    description: 'Explosive push-up where hands leave the floor at the top of the rep.',
    defaultSets: 3, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 10
  },

  // ── BODYWEIGHT (6) ──
  {
    name: 'Push-Ups', type: 'strength', muscleGroup: 'chest',
    difficulty: 'beginner', equipment: 'bodyweight',
    description: 'Classic bodyweight chest press from plank position.',
    defaultSets: 3, defaultReps: 15, defaultDuration: 0, caloriesPerMinute: 7
  },
  {
    name: 'Plank', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'Hold a rigid plank position on forearms or hands for time.',
    defaultSets: 3, defaultReps: 0, defaultDuration: 1, caloriesPerMinute: 4
  },
  {
    name: 'Sit-Ups', type: 'strength', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'Classic abdominal crunch bringing torso up to knees.',
    defaultSets: 3, defaultReps: 20, defaultDuration: 0, caloriesPerMinute: 5
  },
  {
    name: 'Bodyweight Squat', type: 'strength', muscleGroup: 'legs',
    difficulty: 'beginner', equipment: 'none',
    description: 'Squat to parallel with just bodyweight; focus on form.',
    defaultSets: 3, defaultReps: 20, defaultDuration: 0, caloriesPerMinute: 5
  },
  {
    name: 'Glute Bridge', type: 'strength', muscleGroup: 'glutes',
    difficulty: 'beginner', equipment: 'none',
    description: 'Lie on back, drive hips upward by squeezing glutes.',
    defaultSets: 3, defaultReps: 15, defaultDuration: 0, caloriesPerMinute: 4
  },
  {
    name: 'Superman Hold', type: 'flexibility', muscleGroup: 'back',
    difficulty: 'beginner', equipment: 'none',
    description: 'Lie prone and raise arms and legs off the floor simultaneously.',
    defaultSets: 3, defaultReps: 12, defaultDuration: 0, caloriesPerMinute: 3
  },

  // ── FLEXIBILITY / CORE (5) ──
  {
    name: 'Dead Bug', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'Lie on back, extend opposite arm and leg while maintaining flat lower back.',
    defaultSets: 3, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 3
  },
  {
    name: 'Bird Dog', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'From quadruped, extend opposite arm and leg while keeping hips level.',
    defaultSets: 3, defaultReps: 10, defaultDuration: 0, caloriesPerMinute: 3
  },
  {
    name: 'Hollow Hold', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'intermediate', equipment: 'none',
    description: 'Lie on back, press lower back down, and hold arms and legs elevated.',
    defaultSets: 3, defaultReps: 0, defaultDuration: 1, caloriesPerMinute: 4
  },
  {
    name: 'Russian Twist', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'beginner', equipment: 'none',
    description: 'Seated with feet off floor, rotate torso side to side.',
    defaultSets: 3, defaultReps: 20, defaultDuration: 0, caloriesPerMinute: 4
  },
  {
    name: 'Leg Raises', type: 'flexibility', muscleGroup: 'core',
    difficulty: 'intermediate', equipment: 'none',
    description: 'Lie flat, raise straight legs to 90° and lower slowly.',
    defaultSets: 3, defaultReps: 15, defaultDuration: 0, caloriesPerMinute: 4
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');

    const inserted = await Exercise.insertMany(exercises);
    console.log(`✅ Seeded ${inserted.length} exercises successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
