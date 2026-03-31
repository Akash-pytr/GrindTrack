import Session from '../models/Session.js';

export const startSession = async (req, res) => {
  try {
    const session = await Session.create({
      userId: req.user._id,
      startTime: new Date(),
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const stopSession = async (req, res) => {
  try {
    const { activeTime, distractionCount } = req.body;
    const session = await Session.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    session.endTime = new Date();
    session.activeTime = activeTime;
    session.distractionCount = distractionCount;
    session.status = 'completed';
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
