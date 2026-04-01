require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const SessionManager = require('./utils/sessionManager');
const CallManager = require('./utils/callManager');
const { SOCKET_EVENTS, ERRORS, SESSION } = require('./config/constants');
const { generateChatText, generateFileName } = require('./utils/chatExporter');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize session manager
const sessionManager = new SessionManager();
const callManager = new CallManager();

// Store socket connections with session info
const userSessions = new Map(); // socketId -> { code, username }
const typingUsers = new Map(); // sessionCode -> Set of usernames typing

// ==================== UTILITY FUNCTIONS ====================

function startInactivityTimer(code) {
  const session = sessionManager.getSession(code);
  if (!session) return;

  // Clear existing timer
  if (session.inactivityTimer) {
    clearTimeout(session.inactivityTimer);
  }

  // Set new timer (40-60 mins randomly)
  const timeoutMs =
    (SESSION.INACTIVITY_TIMEOUT_MIN + Math.random() * (SESSION.INACTIVITY_TIMEOUT_MAX - SESSION.INACTIVITY_TIMEOUT_MIN)) *
    60 *
    1000;

  session.inactivityTimer = setTimeout(() => {
    closeSessionDueToInactivity(code);
  }, timeoutMs);
}

function closeSessionDueToInactivity(code) {
  const session = sessionManager.getSession(code);
  if (!session || session.status !== 'active') return;

  console.log(`[AUTO-CLOSE] Session ${code} closed due to inactivity`);

  sessionManager.closeSession(code, 'INACTIVITY_TIMEOUT');
  io.to(code).emit(SOCKET_EVENTS.SESSION_CLOSED, {
    reason: 'INACTIVITY_TIMEOUT',
    message: 'Session closed due to inactivity',
  });

  // Disconnect all clients in this room
  io.to(code).disconnectSockets();
}

function broadcastParticipants(code) {
  const participants = sessionManager.getParticipants(code);
  if (participants) {
    io.to(code).emit(SOCKET_EVENTS.USER_JOINED, {
      participants: participants.map((p) => p.username),
    });
  }
}

// ==================== REST ENDPOINTS ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    activeSessions: sessionManager.getActiveSessions().length,
  });
});

// ==================== SOCKET.IO EVENTS ====================

io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  // ========== CREATE SESSION ==========
  socket.on(SOCKET_EVENTS.CREATE_SESSION, (data) => {
    const { username } = data;

    if (!username || username.trim().length === 0) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Username is required' });
      return;
    }

    try {
      const session = sessionManager.createSession(username);
      const code = session.code;

      // Store user session info
      userSessions.set(socket.id, { code, username });

      // Join socket to room
      socket.join(code);

      // Start inactivity timer
      startInactivityTimer(code);

      console.log(`[CREATE] Session ${code} created by ${username}`);

      socket.emit(SOCKET_EVENTS.SESSION_CREATED, {
        code,
        participants: session.participants.map((p) => p.username),
        isCreator: true,
      });
    } catch (error) {
      console.error('[ERROR] Create session failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to create session' });
    }
  });

  // ========== JOIN SESSION ==========
  socket.on(SOCKET_EVENTS.JOIN_SESSION, (data) => {
    const { code, username } = data;

    if (!code || !username || username.trim().length === 0) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Code and username are required' });
      return;
    }

    try {
      const result = sessionManager.joinSession(code, username);

      if (!result.success) {
        const errorMsg = ERRORS[result.error] || 'Failed to join session';
        socket.emit(SOCKET_EVENTS.ERROR, { message: errorMsg, errorCode: result.error });
        return;
      }

      // Store user session info
      userSessions.set(socket.id, { code, username });

      // Join socket to room
      socket.join(code);

      // Reset inactivity timer
      startInactivityTimer(code);

      console.log(`[JOIN] ${username} joined session ${code}`);

      // Send session data to new user (chat history)
      const sessionData = sessionManager.getSessionData(code);
      socket.emit(SOCKET_EVENTS.USER_JOINED, {
        participants: result.session.participants.map((p) => p.username),
        chatHistory: sessionData.messages,
        isCreator: false,
      });

      // Broadcast to others that new user joined
      socket.to(code).emit(SOCKET_EVENTS.USER_JOINED, {
        username,
        participants: result.session.participants.map((p) => p.username),
      });
    } catch (error) {
      console.error('[ERROR] Join session failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join session' });
    }
  });

  // ========== SEND MESSAGE ==========
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, (data) => {
    const { code, message } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession) {
      console.error(`[ERROR] No user session found for socket ${socket.id}`);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session - user session not found' });
      return;
    }

    if (userSession.code !== code) {
      console.error(
        `[ERROR] Session code mismatch. Expected: ${userSession.code}, Got: ${code}`
      );
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session - code mismatch' });
      return;
    }

    if (!message || message.trim().length === 0) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Message cannot be empty' });
      return;
    }

    try {
      const msg = sessionManager.addMessage(code, userSession.username, message);
      startInactivityTimer(code);

      // Clear typing indicator
      if (typingUsers.has(code)) {
        typingUsers.get(code).delete(userSession.username);
      }

      io.to(code).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, msg);
      io.to(code).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
        username: userSession.username,
      });
    } catch (error) {
      console.error('[ERROR] Send message failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to send message' });
    }
  });

  // ========== EDIT MESSAGE ==========
  socket.on(SOCKET_EVENTS.EDIT_MESSAGE, (data) => {
    const { code, messageId, newText } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    if (!newText || newText.trim().length === 0) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'New text cannot be empty' });
      return;
    }

    try {
      const message = sessionManager.editMessage(code, messageId, newText);
      if (!message) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Message not found' });
        return;
      }

      startInactivityTimer(code);
      io.to(code).emit(SOCKET_EVENTS.MESSAGE_EDITED, message);
    } catch (error) {
      console.error('[ERROR] Edit message failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to edit message' });
    }
  });

  // ========== DELETE MESSAGE ==========
  socket.on(SOCKET_EVENTS.DELETE_MESSAGE, (data) => {
    const { code, messageId } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    try {
      const message = sessionManager.deleteMessage(code, messageId);
      if (!message) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Message not found' });
        return;
      }

      startInactivityTimer(code);
      io.to(code).emit(SOCKET_EVENTS.MESSAGE_DELETED, message);
    } catch (error) {
      console.error('[ERROR] Delete message failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to delete message' });
    }
  });

  // ========== TYPING START ==========
  socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    if (!typingUsers.has(code)) {
      typingUsers.set(code, new Set());
    }
    typingUsers.get(code).add(userSession.username);

    socket.to(code).emit(SOCKET_EVENTS.USER_TYPING, {
      username: userSession.username,
    });
  });

  // ========== TYPING STOP ==========
  socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    if (typingUsers.has(code)) {
      typingUsers.get(code).delete(userSession.username);
    }

    socket.to(code).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
      username: userSession.username,
    });
  });

  // ========== LEAVE SESSION ==========
  socket.on(SOCKET_EVENTS.LEAVE_SESSION, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession) {
      return;
    }

    const result = sessionManager.removeParticipant(code, userSession.username);

    if (result === 'SESSION_CLOSED') {
      console.log(`[CLOSE] Session ${code} closed - creator left`);
      io.to(code).emit(SOCKET_EVENTS.SESSION_CLOSED, {
        reason: 'CREATOR_LEFT',
        message: 'Session creator left the chat',
      });
      io.to(code).disconnectSockets();
    } else {
      console.log(`[LEAVE] ${userSession.username} left session ${code}`);
      startInactivityTimer(code);
      
      if (callManager.isInCall(code)) {
        callManager.removeParticipant(code, userSession.username);
        const call = callManager.getCall(code);
        if (call) {
          io.to(code).emit(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, {
            username: userSession.username,
            participants: call.participants,
          });
        } else {
          io.to(code).emit(SOCKET_EVENTS.CALL_ENDED, {
            endedBy: userSession.username,
          });
        }
      }
      
      io.to(code).emit(SOCKET_EVENTS.USER_LEFT, {
        username: userSession.username,
      });
    }

    socket.leave(code);
    userSessions.delete(socket.id);
  });

  // ========== END SESSION ==========
  socket.on(SOCKET_EVENTS.END_SESSION, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    const session = sessionManager.getSession(code);
    if (!session || session.createdBy !== userSession.username) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only session creator can end the session' });
      return;
    }

    try {
      console.log(`[END] Session ${code} ended by ${userSession.username}`);
      sessionManager.closeSession(code);

      // Send chat data before closing
      const sessionData = sessionManager.getSessionData(code);
      io.to(code).emit(SOCKET_EVENTS.SESSION_CLOSED, {
        reason: 'CREATOR_ENDED',
        message: 'Session ended by creator',
        chatData: sessionData,
      });

      // Disconnect all
      io.to(code).disconnectSockets();
    } catch (error) {
      console.error('[ERROR] End session failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to end session' });
    }
  });

  // ========== DOWNLOAD CHAT ==========
  socket.on(SOCKET_EVENTS.DOWNLOAD_CHAT, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    const session = sessionManager.getSession(code);
    if (!session || session.createdBy !== userSession.username) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only session creator can download chat' });
      return;
    }

    try {
      const sessionData = sessionManager.getSessionData(code);
      const chatText = generateChatText(sessionData);
      const fileName = generateFileName(code);

      socket.emit(SOCKET_EVENTS.CHAT_DATA, {
        fileName,
        content: chatText,
      });
    } catch (error) {
      console.error('[ERROR] Download chat failed:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to download chat' });
    }
  });

  // ========== INITIATE CALL ==========
  socket.on(SOCKET_EVENTS.CALL_INITIATED, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    const session = sessionManager.getSession(code);
    if (!session || session.createdBy !== userSession.username) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only creator can initiate call' });
      return;
    }

    if (callManager.isInCall(code)) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Call already in progress' });
      return;
    }

    const call = callManager.createCall(code, userSession.username);

    io.to(code).emit(SOCKET_EVENTS.CALL_INVITATION, {
      callId: call.id,
      initiator: userSession.username,
      participants: call.participants,
    });

    console.log(`[CALL] ${userSession.username} initiated call in session ${code}`);
  });

  // ========== ACCEPT CALL ==========
  socket.on(SOCKET_EVENTS.CALL_ACCEPTED, (data) => {
    const { code, callId } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    const call = callManager.getCall(code);
    if (!call || call.id !== callId) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Call not found' });
      return;
    }

    callManager.addParticipant(code, userSession.username);

    io.to(code).emit(SOCKET_EVENTS.CALL_PARTICIPANT_JOINED, {
      callId: call.id,
      username: userSession.username,
      participants: call.participants,
    });

    console.log(`[CALL] ${userSession.username} joined call ${callId}`);
  });

  // ========== DECLINE CALL ==========
  socket.on(SOCKET_EVENTS.CALL_DECLINED, (data) => {
    const { code, callId } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    const call = callManager.getCall(code);
    if (!call || call.id !== callId) {
      return;
    }

    io.to(code).emit(SOCKET_EVENTS.CALL_DECLINED, {
      callId: call.id,
      username: userSession.username,
    });

    console.log(`[CALL] ${userSession.username} declined call ${callId}`);
  });

  // ========== END CALL ==========
  socket.on(SOCKET_EVENTS.CALL_ENDED, (data) => {
    const { code } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid session' });
      return;
    }

    const call = callManager.getCall(code);
    if (!call) {
      return;
    }

    callManager.endCall(code);

    io.to(code).emit(SOCKET_EVENTS.CALL_ENDED, {
      callId: call.id,
      endedBy: userSession.username,
    });

    console.log(`[CALL] Call ended in session ${code} by ${userSession.username}`);
  });

  // ========== OFFER ==========
  socket.on(SOCKET_EVENTS.OFFER, (data) => {
    const { code, offer, targetUsername } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    const targetSocket = Array.from(io.sockets.sockets.values())
      .find(s => userSessions.get(s.id)?.username === targetUsername && userSessions.get(s.id)?.code === code);

    if (targetSocket) {
      targetSocket.emit(SOCKET_EVENTS.OFFER, {
        offer,
        fromUsername: userSession.username,
      });
    }
  });

  // ========== ANSWER ==========
  socket.on(SOCKET_EVENTS.ANSWER, (data) => {
    const { code, answer, targetUsername } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    const targetSocket = Array.from(io.sockets.sockets.values())
      .find(s => userSessions.get(s.id)?.username === targetUsername && userSessions.get(s.id)?.code === code);

    if (targetSocket) {
      targetSocket.emit(SOCKET_EVENTS.ANSWER, {
        answer,
        fromUsername: userSession.username,
      });
    }
  });

  // ========== ICE CANDIDATE ==========
  socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data) => {
    const { code, candidate, targetUsername } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || userSession.code !== code) {
      return;
    }

    const targetSocket = Array.from(io.sockets.sockets.values())
      .find(s => userSessions.get(s.id)?.username === targetUsername && userSessions.get(s.id)?.code === code);

    if (targetSocket) {
      targetSocket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
        candidate,
        fromUsername: userSession.username,
      });
    }
  });

  // ========== DISCONNECT ==========
  socket.on('disconnect', () => {
    const userSession = userSessions.get(socket.id);

    if (userSession) {
      const { code, username } = userSession;
      console.log(`[DISCONNECT] ${username} disconnected from session ${code}`);

      const result = sessionManager.removeParticipant(code, username);

      if (result === 'SESSION_CLOSED') {
        console.log(`[AUTO-CLOSE] Session ${code} closed - creator disconnected`);
        io.to(code).emit(SOCKET_EVENTS.SESSION_CLOSED, {
          reason: 'CREATOR_DISCONNECTED',
          message: 'Session creator disconnected',
        });
      } else {
        startInactivityTimer(code);
        
        if (callManager.isInCall(code)) {
          callManager.removeParticipant(code, username);
          const call = callManager.getCall(code);
          if (call) {
            io.to(code).emit(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, {
              username,
              participants: call.participants,
            });
          } else {
            io.to(code).emit(SOCKET_EVENTS.CALL_ENDED, {
              endedBy: username,
            });
          }
        }
        
        io.to(code).emit(SOCKET_EVENTS.USER_LEFT, {
          username,
        });
      }

      // Clean up typing status
      if (typingUsers.has(code)) {
        typingUsers.get(code).delete(username);
      }
    }

    userSessions.delete(socket.id);
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
