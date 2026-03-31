import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  activeTime: {
    type: Number, // in seconds
    default: 0,
  },
  distractionCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
