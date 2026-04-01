// Configuration constants for the chat app

module.exports = {
  // Session settings
  SESSION: {
    MAX_PARTICIPANTS: 10,
    CODE_LENGTH: 10,
    INACTIVITY_TIMEOUT_MIN: 40, // minutes
    INACTIVITY_TIMEOUT_MAX: 60, // minutes
  },

  // Message settings
  MESSAGE: {
    MAX_LENGTH: 5000,
  },

  // Socket events
  SOCKET_EVENTS: {
    // Session events
    CREATE_SESSION: 'create_session',
    SESSION_CREATED: 'session_created',
    JOIN_SESSION: 'join_session',
    USER_JOINED: 'user_joined',
    SESSION_FULL: 'session_full',
    INVALID_CODE: 'invalid_code',
    LEAVE_SESSION: 'leave_session',
    USER_LEFT: 'user_left',
    END_SESSION: 'end_session',
    SESSION_CLOSED: 'session_closed',

    // Message events
    SEND_MESSAGE: 'send_message',
    MESSAGE_RECEIVED: 'message_received',
    EDIT_MESSAGE: 'edit_message',
    MESSAGE_EDITED: 'message_edited',
    DELETE_MESSAGE: 'delete_message',
    MESSAGE_DELETED: 'message_deleted',

    // Typing events
    TYPING_START: 'typing_start',
    USER_TYPING: 'user_typing',
    TYPING_STOP: 'typing_stop',
    USER_STOPPED_TYPING: 'user_stopped_typing',

    // Download event
    DOWNLOAD_CHAT: 'download_chat',
    CHAT_DATA: 'chat_data',

    // Error event
    ERROR: 'error',

    // Call events
    CALL_INITIATED: 'call_initiated',
    CALL_INVITATION: 'call_invitation',
    CALL_ACCEPTED: 'call_accepted',
    CALL_DECLINED: 'call_declined',
    CALL_ENDED: 'call_ended',
    CALL_PARTICIPANT_JOINED: 'call_participant_joined',
    CALL_PARTICIPANT_LEFT: 'call_participant_left',
    OFFER: 'offer',
    ANSWER: 'answer',
    ICE_CANDIDATE: 'ice_candidate',
  },

  // Error messages
  ERRORS: {
    SESSION_NOT_FOUND: 'Session not found',
    SESSION_FULL: 'Session is full',
    INVALID_CODE: 'Invalid session code',
    USERNAME_TAKEN: 'Username already taken in this session',
    NOT_SESSION_CREATOR: 'Only session creator can end the session',
    INVALID_MESSAGE: 'Invalid message',
  },
};
