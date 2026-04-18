const Room = require('../models/Room');
const InterviewSession = require('../models/InterviewSession');
const { v4: uuidv4 } = require('uuid');

const createRoom = async (req, res) => {
  const { questionId } = req.body;
  const roomId = uuidv4();

  try {
    const room = await Room.create({
      roomId,
      hostId: req.user.id,
      questionId: questionId || null,
      participants: [req.user.id]
    });

    const session = await InterviewSession.create({
      roomId: room._id,
      candidateId: req.user.id,
      interviewerId: req.user.id,
      startTime: new Date()
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('hostId', 'name email').populate('participants', 'name email').populate('questionId');
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.user.id }).populate('hostId', 'name email').populate('questionId');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinRoom = async (req, res) => {
  const { roomId } = req.body;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.participants.length >= 2 && !room.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Room is full (max 2 users)' });
    }

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();

      // Update Session
      await InterviewSession.updateOne(
        { roomId: room._id },
        { candidateId: req.user.id } // Assume 2nd user is candidate
      );
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRoom,
  getRoom,
  getRooms,
  joinRoom
};
