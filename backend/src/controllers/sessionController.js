import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import Problem from "../models/Problem.js";

/**
 * Creates a new interview session.
 * @route POST /api/sessions
 * @access Private (Authenticated users)
 */
export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId role")
      .populate("participant", "name profileImage email clerkId role")
      .populate("interviewer", "name profileImage email clerkId role")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId role")
      .populate("participant", "name email profileImage clerkId role")
      .populate("interviewer", "name email profileImage clerkId role");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    // Send system message
    await channel.sendMessage({
      text: "Participant has joined the session 👋",
      user: { id: "system" },
    });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Allows an interviewer to join an active session.
 * Checks for interviewer role and updates session status.
 * @route POST /api/sessions/:id/interviewer
 * @access Private (Interviewer only)
 */
export async function joinSessionAsInterviewer(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const userRole = req.user.role;

    // Verify user is an interviewer
    if (userRole !== "interviewer") {
      return res.status(403).json({ message: "Only interviewers can use this endpoint" });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    // Update session with interviewer
    session.interviewer = userId;
    await session.save();

    // Add interviewer to the video call
    const call = streamClient.video.call("default", session.callId);
    await call.getOrCreate({
      data: {
        created_by_id: clerkId,
      },
    });

    // Add interviewer to chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    // Send system message
    await channel.sendMessage({
      text: "Interviewer has joined the session 👨‍💻",
      user: { id: "system" },
    });

    // Populate session data before returning
    const populatedSession = await Session.findById(id)
      .populate("host", "name email profileImage clerkId role")
      .populate("participant", "name email profileImage clerkId role")
      .populate("interviewer", "name email profileImage clerkId role");

    res.status(200).json({ session: populatedSession });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateSessionProblem(req, res) {
  try {
    const { id } = req.params;
    const { problemId } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Check if user is the interviewer
    if (session.interviewer?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the interviewer can update the problem" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot update problem in a completed session" });
    }

    // Since we're currently using problem title as the identifier in the session model,
    // we need to look up the problem title if an ID was passed, or use the string if it's a legacy problem
    // However, existing sessions use the "problem" field as a String (title).
    // Let's assume problemId is actually the title for now to maintain compatibility with the current frontend/data structure,
    // OR we change the frontend to pass the title.
    // Given the structure, let's look up the problem by ID if it looks like an ID, otherwise assume it's a title.

    let problemTitle = problemId;

    // Check if problemId is a valid ObjectId, if so, fetch title from DB
    if (problemId.match(/^[0-9a-fA-F]{24}$/)) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        problemTitle = problem.title;
      }
    }

    session.problem = problemTitle;
    await session.save();

    // Update Stream Call custom data so frontend can react
    const call = streamClient.video.call("default", session.callId);
    await call.update({
      custom: {
        problem: problemTitle,
      },
    });

    // Also send a chat message to notify participants
    const channel = chatClient.channel("messaging", session.callId);
    await channel.sendMessage({
      text: `Interviewer changed the problem to: ${problemTitle}`,
      user: { id: "system" },
    });

    res.status(200).json({ session, message: "Session problem updated successfully" });
  } catch (error) {
    console.log("Error in updateSessionProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
