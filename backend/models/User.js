import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0,
  },
  lastSessionDate: {
    type: Date,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  // Level and medals
  level: {
    type: Number,
    default: 1,
  },
  totalXP: {
    type: Number,
    default: 0,
  },
  medals: {
    type: [String],
    default: [],
  },
  // Goals
  dailyFocusGoal: {
    type: Number, // in minutes
    default: 60,
  },
  distractionGoal: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);
