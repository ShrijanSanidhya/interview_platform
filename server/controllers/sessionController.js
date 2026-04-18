const InterviewSession = require('../models/InterviewSession');
const Room = require('../models/Room');

const getSession = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    const session = await InterviewSession.findOne({ roomId: room._id })
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email');
      
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSessionNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    const session = await InterviewSession.findOne({ roomId: room._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.notes = notes;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { code, timeTakenStr } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    room.status = 'completed';
    await room.save();

    const session = await InterviewSession.findOne({ roomId: room._id });
    if (session) {
      session.endTime = new Date();
      if (code) session.codeSubmitted = code;
      // We can store timeTakenStr somehow, maybe add to notes or a new field.
      // Let's just append to notes for simplicity if schema isn't strictly changed.
      await session.save();
    }
    
    res.json({ message: 'Session ended successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSession,
  updateSessionNotes,
  endSession
};
