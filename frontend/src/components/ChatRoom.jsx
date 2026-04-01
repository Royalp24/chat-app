import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket.jsx';
import { SOCKET_EVENTS } from '../utils/socketEvents';
import { downloadFile } from '../utils/formatting';
import { CallProvider, useCall } from '../contexts/CallContext';
import MessageBubble from './MessageBubble';
import ParticipantList from './ParticipantList';
import TypingIndicator from './TypingIndicator';
import CallNotification from './CallNotification';
import CallPanel from './CallPanel';
import CallControls from './CallControls';
import CallError from './CallError';
import '../styles/chatRoom.css';

function ChatRoomContent({
  sessionCode,
  username,
  isCreator,
  onSessionClose,
}) {
  const { socket, emit } = useSocket();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState(isCreator ? [username] : []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      setMessages((prev) => [...prev, message]);
      setError('');
    };

    const handleMessageEdited = (message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    };

    const handleMessageDeleted = (message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    };

    const handleUserTyping = (data) => {
      setTypingUsers((prev) => new Set([...prev, data.username]));
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.username);
        return newSet;
      });
    };

    const handleUserJoined = (data) => {
      if (data.chatHistory) {
        setMessages(data.chatHistory);
      }
      if (data.participants) {
        setParticipants(data.participants);
      }
      if (data.username) {
        setParticipants((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      }
    };

    const handleSessionCreated = (data) => {
      if (data.participants) {
        setParticipants(data.participants);
      }
    };

    const handleUserLeft = (data) => {
      if (data.username) {
        setParticipants((prev) => prev.filter((p) => p !== data.username));
      }
    };

    const handleSessionClosed = (data) => {
      setIsClosing(true);
      setTimeout(() => {
        onSessionClose(data);
      }, 2000);
    };

    const handleError = (data) => {
      setError(data.message || 'An error occurred');
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, handleUserStoppedTyping);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
    socket.on(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    const handleChatData = (data) => {
      downloadFile(data.content, data.fileName);
    };
    socket.on(SOCKET_EVENTS.CHAT_DATA, handleChatData);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.USER_STOPPED_TYPING, handleUserStoppedTyping);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
      socket.off(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.off(SOCKET_EVENTS.CHAT_DATA, handleChatData);
    };
  }, [socket, isCreator, onSessionClose]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      emit(SOCKET_EVENTS.TYPING_START, { code: sessionCode });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit(SOCKET_EVENTS.TYPING_STOP, { code: sessionCode });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      setError('Message cannot be empty');
      return;
    }

    emit(SOCKET_EVENTS.SEND_MESSAGE, {
      code: sessionCode,
      message: inputValue.trim(),
    });

    setInputValue('');
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);
    emit(SOCKET_EVENTS.TYPING_STOP, { code: sessionCode });
    inputRef.current?.focus();
  };

  const handleEditMessage = (messageId, newText) => {
    emit(SOCKET_EVENTS.EDIT_MESSAGE, {
      code: sessionCode,
      messageId,
      newText,
    });
  };

  const handleDeleteMessage = (messageId) => {
    emit(SOCKET_EVENTS.DELETE_MESSAGE, {
      code: sessionCode,
      messageId,
    });
  };

  const handleLeaveSession = () => {
    if (confirm('Leave this chat session')) {
      emit(SOCKET_EVENTS.LEAVE_SESSION, { code: sessionCode });
      onSessionClose({ reason: 'USER_LEFT' });
    }
  };

  const handleEndSession = () => {
    setShowDownloadPrompt(true);
  };

  const handleDownloadChat = () => {
    emit(SOCKET_EVENTS.DOWNLOAD_CHAT, { code: sessionCode });
    setShowDownloadPrompt(false);
    setShowConfirmEnd(true);
  };

  const handleSkipDownload = () => {
    setShowDownloadPrompt(false);
    setShowConfirmEnd(true);
  };

  const handleConfirmEnd = () => {
    if (confirm('End this chat session. All messages will be deleted')) {
      setShowConfirmEnd(false);
      emit(SOCKET_EVENTS.END_SESSION, { code: sessionCode });
    } else {
      setShowConfirmEnd(false);
      setShowDownloadPrompt(true);
    }
  };

  const handleCancelEnd = () => {
    setShowDownloadPrompt(false);
    setShowConfirmEnd(false);
  };

  const { callState, initiateCall } = useCall();
  const isInCall = callState === 'connected' || callState === 'calling';

  return (
    <div className={`chat-room ${isInCall ? 'in-call' : ''}`}>
      <div className="chat-header">
        <div className="header-left">
          <h1 className="session-title">
            {username}'s Session
          </h1>
          <p className="session-role">{isCreator ? '👑 Creator' : '👤 Guest'}</p>
          <p className="session-code">Code: {sessionCode}</p>
        </div>
        <div className="header-right">
          {isCreator && (
            <button
              className="btn btn-primary call-btn-header"
              onClick={initiateCall}
              disabled={callState !== 'idle'}
            >
              <span>📞</span>
              Start Call
            </button>
          )}
          <div className="connection-status connected">
            <span className="status-dot"></span>
            Connected
          </div>
          {error && <div className="header-error">{error}</div>}
        </div>
      </div>

      <div className="chat-container">
        <ParticipantList participants={participants} currentUser={username} />

        <div className="chat-main">
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👋</div>
                <h3>No messages yet</h3>
                <p>Start the conversation</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.username === username}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </>
            )}

            {typingUsers.size > 0 && (
              <div className="typing-area">
                <span className="typing-label">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
                </span>
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                ref={inputRef}
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={inputValue}
                onChange={handleInputChange}
                disabled={isClosing}
                maxLength={5000}
              />
              <button
                type="submit"
                className="btn btn-primary btn-send"
                disabled={!inputValue.trim() || isClosing}
              >
                Send
              </button>
            </form>
            <small className="input-length">{inputValue.length}/5000</small>
          </div>
        </div>
      </div>

      <div className="chat-footer">
        <button
          className="btn btn-outline"
          onClick={handleLeaveSession}
          disabled={isClosing}
        >
          Leave
        </button>
        {isCreator && (
          <button
            className="btn btn-danger"
            onClick={handleEndSession}
            disabled={isClosing}
          >
            End Session
          </button>
        )}
      </div>

      {showDownloadPrompt && isCreator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Download Chat History</h3>
            <p>The session is ending. Would you like to download the chat history as a text file</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleDownloadChat}
              >
                Download
              </button>
              <button
                className="btn btn-outline"
                onClick={handleSkipDownload}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmEnd && isCreator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm End Session</h3>
            <p>Are you sure you want to end this chat session. All messages will be deleted</p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={handleConfirmEnd}
              >
                End Session
              </button>
              <button
                className="btn btn-outline"
                onClick={handleCancelEnd}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isClosing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Session Ended</h3>
            <p>This chat session has been closed</p>
            <p className="modal-loading">Redirecting...</p>
          </div>
        </div>
      )}

      <CallNotification />
      <CallPanel />
      <CallControls />
      <CallError />
    </div>
  );
}

export default function ChatRoom(props) {
  return (
    <CallProvider {...props}>
      <ChatRoomContent {...props} />
    </CallProvider>
  );
}
