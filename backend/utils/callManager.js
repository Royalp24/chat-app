const { generateMessageId } = require('./codeGenerator');

class CallManager {
  constructor() {
    this.calls = new Map();
  }

  createCall(sessionCode, initiator) {
    const call = {
      id: generateMessageId(),
      sessionCode,
      initiator,
      participants: [initiator],
      status: 'initiating',
      createdAt: new Date(),
    };

    this.calls.set(sessionCode, call);
    return call;
  }

  getCall(sessionCode) {
    return this.calls.get(sessionCode);
  }

  addParticipant(sessionCode, username) {
    const call = this.calls.get(sessionCode);
    if (!call) return null;

    if (!call.participants.includes(username)) {
      call.participants.push(username);
    }
    return call;
  }

  removeParticipant(sessionCode, username) {
    const call = this.calls.get(sessionCode);
    if (!call) return null;

    call.participants = call.participants.filter(p => p !== username);

    if (call.participants.length === 0) {
      this.endCall(sessionCode);
      return null;
    }

    if (username === call.initiator) {
      this.endCall(sessionCode);
      return null;
    }

    return call;
  }

  endCall(sessionCode) {
    const call = this.calls.get(sessionCode);
    if (call) {
      call.status = 'ended';
      call.endedAt = new Date();
      this.calls.delete(sessionCode);
    }
    return call;
  }

  isInCall(sessionCode) {
    const call = this.calls.get(sessionCode);
    return call && call.status !== 'ended';
  }
}

module.exports = CallManager;
