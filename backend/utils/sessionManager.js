const { generateInvitationCode, generateMessageId } = require('./codeGenerator');
const { SESSION } = require('../config/constants');

class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionCode -> session object
  }

  /**
   * Create a new session
   */
  createSession(username) {
    let code;
    let isUnique = false;

    // Generate unique code
    while (!isUnique) {
      code = generateInvitationCode();
      if (!this.sessions.has(code)) {
        isUnique = true;
      }
    }

    const session = {
      code,
      createdAt: new Date(),
      createdBy: username,
      creator: {
        username,
        isOnline: true,
      },
      participants: [{ username, joinedAt: new Date(), isOnline: true }],
      messages: [],
      status: 'active',
      inactivityTimer: null,
      lastActivityAt: new Date(),
    };

    this.sessions.set(code, session);
    return session;
  }

  /**
   * Get session by code
   */
  getSession(code) {
    return this.sessions.get(code);
  }

  /**
   * Check if code exists and is valid
   */
  isValidCode(code) {
    const session = this.sessions.get(code);
    return session && session.status === 'active';
  }

  /**
   * Join a session
   */
  joinSession(code, username) {
    const session = this.sessions.get(code);

    if (!session) {
      return { success: false, error: 'SESSION_NOT_FOUND' };
    }

    if (session.status !== 'active') {
      return { success: false, error: 'SESSION_CLOSED' };
    }

    if (session.participants.length >= SESSION.MAX_PARTICIPANTS) {
      return { success: false, error: 'SESSION_FULL' };
    }

    // Check if username already exists in session
    // If the same user is reconnecting (e.g., after a dropped connection or page refresh),
    // remove the stale entry so they can rejoin cleanly instead of getting blocked.
    const existingIndex = session.participants.findIndex((p) => p.username === username);
    if (existingIndex !== -1) {
      // If this is the session creator trying to rejoin, block it
      // (creator rejoining is handled as a hard error; they should end & recreate).
      if (session.createdBy === username) {
        return { success: false, error: 'USERNAME_TAKEN' };
      }
      // Otherwise it's a guest reconnecting — remove stale entry and allow rejoin
      session.participants.splice(existingIndex, 1);
    }

    // Add participant
    session.participants.push({
      username,
      joinedAt: new Date(),
      isOnline: true,
    });

    return { success: true, session };
  }

  /**
   * Remove participant from session
   */
  removeParticipant(code, username, graceful = false) {
    const session = this.sessions.get(code);
    if (!session) return false;

    session.participants = session.participants.filter((p) => p.username !== username);

    // If creator leaves
    if (session.creator.username === username) {
      if (graceful) {
        // Don't close yet — mark offline and let caller start a grace-period timer
        session.creator.isOnline = false;
        return 'CREATOR_OFFLINE';
      }
      this.closeSession(code, 'CREATOR_LEFT');
      return 'SESSION_CLOSED';
    }

    return true;
  }

  /**
   * Allow creator to rejoin during the grace period
   */
  allowCreatorRejoin(code, username) {
    const session = this.sessions.get(code);
    if (!session || session.createdBy !== username) return null;
    if (session.status !== 'active') return null;

    // Cancel the grace-period close timer
    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
      session.reconnectTimer = null;
    }

    // Mark creator back online and re-add to participants
    session.creator.isOnline = true;
    session.participants.push({ username, joinedAt: new Date(), isOnline: true });
    return session;
  }

  /**
   * Add message to session
   */
  addMessage(code, username, text) {
    const session = this.sessions.get(code);
    if (!session) return null;

    const message = {
      id: generateMessageId(),
      username,
      text,
      timestamp: new Date(),
      edited: false,
      deleted: false,
    };

    session.messages.push(message);
    session.lastActivityAt = new Date();

    return message;
  }

  /**
   * Edit message
   */
  editMessage(code, messageId, newText) {
    const session = this.sessions.get(code);
    if (!session) return null;

    const message = session.messages.find((m) => m.id === messageId);
    if (!message) return null;

    message.text = newText;
    message.edited = true;
    message.editedAt = new Date();
    session.lastActivityAt = new Date();

    return message;
  }

  /**
   * Delete message
   */
  deleteMessage(code, messageId) {
    const session = this.sessions.get(code);
    if (!session) return null;

    const message = session.messages.find((m) => m.id === messageId);
    if (!message) return null;

    message.deleted = true;
    message.text = '';
    session.lastActivityAt = new Date();

    return message;
  }

  /**
   * Close session
   */
  closeSession(code, reason = 'MANUAL') {
    const session = this.sessions.get(code);
    if (!session) return false;

    session.status = 'closed';

    // Clear inactivity timer
    if (session.inactivityTimer) {
      clearTimeout(session.inactivityTimer);
    }

    return true;
  }

  /**
   * Get session data with full history
   */
  getSessionData(code) {
    const session = this.sessions.get(code);
    return session
      ? {
          code: session.code,
          createdAt: session.createdAt,
          createdBy: session.createdBy,
          participants: session.participants.map((p) => ({
            username: p.username,
            joinedAt: p.joinedAt,
          })),
          messages: session.messages,
        }
      : null;
  }

  /**
   * Get all participants in session
   */
  getParticipants(code) {
    const session = this.sessions.get(code);
    return session ? session.participants : null;
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(code) {
    const session = this.sessions.get(code);
    if (session) {
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Get expired sessions
   */
  getExpiredSessions(timeoutMs) {
    const expired = [];
    const now = new Date();

    for (const [code, session] of this.sessions) {
      if (session.status === 'active') {
        const timeDiff = now - session.lastActivityAt;
        if (timeDiff > timeoutMs) {
          expired.push(code);
        }
      }
    }

    return expired;
  }

  /**
   * Delete session completely
   */
  deleteSession(code) {
    return this.sessions.delete(code);
  }

  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions() {
    const active = [];
    for (const [code, session] of this.sessions) {
      if (session.status === 'active') {
        active.push({
          code,
          participantCount: session.participants.length,
          messageCount: session.messages.length,
          createdAt: session.createdAt,
        });
      }
    }
    return active;
  }
}

module.exports = SessionManager;
