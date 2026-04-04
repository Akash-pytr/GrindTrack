import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ['predefined', 'custom'],
    default: 'custom',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  permissions: {
    canEnableCamera: {
      type: Boolean,
      default: false,
    },
    canScreenShare: {
      type: Boolean,
      default: false,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
