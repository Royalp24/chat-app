import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './hooks/useSocket.jsx';
import { SOCKET_EVENTS } from './utils/socketEvents';
import Landing from './components/Landing';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';
import ChatRoom from './components/ChatRoom';
import './styles/globals.css';
import './App.css';

const STORAGE_KEY = 'chatapp_session';

function App() {
  const { socket, isConnected, emit } = useSocket();
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [sessionCode, setSessionCode] = useState('');
  const [username, setUsername] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const hasRejoinedRef = useRef(false);
  const isRejoiningRef = useRef(false);

  const saveSession = useCallback((code, name, creator) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sessionCode: code,
      username: name,
      isCreator: creator,
      timestamp: Date.now(),
    }));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Try to rejoin existing session on page load (guests only)
  useEffect(() => {
    if (!socket || !isConnected || hasRejoinedRef.current) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const { sessionCode: storedCode, username: storedName, isCreator: storedCreator, timestamp } = JSON.parse(stored);

      // Session data expires after 2 hours
      if (Date.now() - timestamp > 2 * 60 * 60 * 1000) {
        clearSession();
        return;
      }

      if (storedCode && storedName && !storedCreator) {
        // Only rejoin for guests, not creators
        console.log('[APP] Found existing guest session, rejoining:', storedCode);
        hasRejoinedRef.current = true;
        isRejoiningRef.current = true;
        setIsLoading(true);
        setSessionCode(storedCode);
        setUsername(storedName);
        setIsCreator(false);
        emit(SOCKET_EVENTS.JOIN_SESSION, { code: storedCode, username: storedName });
      } else if (storedCreator) {
        // For creators, just clear the old session (can't rejoin ephemeral session)
        clearSession();
      }
    } catch (e) {
      console.error('[APP] Error parsing stored session:', e);
      clearSession();
    }
  }, [socket, isConnected, emit, clearSession]);

  useEffect(() => {
    if (!socket) return;

    const handleSessionCreated = (data) => {
      setSessionCode(data.code);
      setIsCreator(true);
      setCurrentScreen('chat');
      setIsLoading(false);
      saveSession(data.code, username, true);
    };

    const handleUserJoined = (data) => {
      // Check if we're joining or rejoining
      if (isRejoiningRef.current || currentScreen === 'join') {
        setCurrentScreen('chat');
        setIsLoading(false);
        isRejoiningRef.current = false;
        saveSession(sessionCode, username, false);
      }
    };

    const handleSessionClosed = () => {
      clearSession();
      hasRejoinedRef.current = false;
      isRejoiningRef.current = false;
      setCurrentScreen('landing');
      setSessionCode('');
      setUsername('');
      setIsCreator(false);
    };

    const handleError = (data) => {
      // If rejoining failed, clear stored session and go to landing
      if (isRejoiningRef.current) {
        clearSession();
        hasRejoinedRef.current = false;
        isRejoiningRef.current = false;
        setCurrentScreen('landing');
      }
      setError(data.message || 'An error occurred');
      setIsLoading(false);
    };

    socket.on(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.SESSION_CLOSED, handleSessionClosed);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [socket, currentScreen, sessionCode, username, saveSession, clearSession]);

  const handleCreateSession = (inputUsername) => {
    setIsLoading(true);
    setError('');
    setUsername(inputUsername);
    
    // Clear any old stored session
    clearSession();
    hasRejoinedRef.current = false;
    isRejoiningRef.current = false;
    
    if (!isConnected) {
      console.log('[APP] Waiting for socket connection before creating session...');
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          clearInterval(checkConnection);
          console.log('[APP] Socket connected, creating session now');
          emit(SOCKET_EVENTS.CREATE_SESSION, { username: inputUsername });
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkConnection);
        if (!socket || !socket.connected) {
          setError('Failed to connect to server. Please try again.');
          setIsLoading(false);
        }
      }, 5000);
    } else {
      emit(SOCKET_EVENTS.CREATE_SESSION, { username: inputUsername });
    }
  };

  const handleJoinSession = (code, inputUsername) => {
    setIsLoading(true);
    setError('');
    setUsername(inputUsername);
    setSessionCode(code);
    setIsCreator(false);
    
    // Clear any old stored session
    clearSession();
    hasRejoinedRef.current = false;
    isRejoiningRef.current = false;
    
    if (!isConnected) {
      console.log('[APP] Waiting for socket connection before joining session...');
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          clearInterval(checkConnection);
          console.log('[APP] Socket connected, joining session now');
          emit(SOCKET_EVENTS.JOIN_SESSION, { code, username: inputUsername });
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkConnection);
        if (!socket || !socket.connected) {
          setError('Failed to connect to server. Please try again.');
          setIsLoading(false);
        }
      }, 5000);
    } else {
      emit(SOCKET_EVENTS.JOIN_SESSION, { code, username: inputUsername });
    }
  };

  const handleSessionClose = () => {
    clearSession();
    hasRejoinedRef.current = false;
    isRejoiningRef.current = false;
    setCurrentScreen('landing');
    setSessionCode('');
    setUsername('');
    setIsCreator(false);
    setError('');
  };

  return (
    <div className="app">
      {currentScreen === 'landing' && (
        <Landing
          onCreateClick={() => setCurrentScreen('create')}
          onJoinClick={() => setCurrentScreen('join')}
        />
      )}

      {currentScreen === 'create' && (
        <CreateSession
          onCreateSession={handleCreateSession}
          isLoading={isLoading}
        />
      )}

      {currentScreen === 'join' && (
        <JoinSession
          onJoinSession={handleJoinSession}
          isLoading={isLoading}
        />
      )}

      {currentScreen === 'chat' && sessionCode && (
        <ChatRoom
          sessionCode={sessionCode}
          username={username}
          isCreator={isCreator}
          onSessionClose={handleSessionClose}
        />
      )}

      {error && currentScreen !== 'chat' && (
        <div className="app-error-banner">
          <div className="error-content">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-sm" onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
