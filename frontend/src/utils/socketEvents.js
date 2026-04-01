// Socket.IO event constants - must match backend

export const SOCKET_EVENTS = {
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
};
