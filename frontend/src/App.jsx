import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket.jsx';
import { SOCKET_EVENTS } from './utils/socketEvents';
import Landing from './components/Landing';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';
import ChatRoom from './components/ChatRoom';
import './styles/globals.css';
import './App.css';

function App() {
  const { socket, isConnected, emit } = useSocket();
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, create, join, chat
  const [sessionCode, setSessionCode] = useState('');
  const [username, setUsername] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Session created successfully
    const handleSessionCreated = (data) => {
      setSessionCode(data.code);
      setIsCreator(true);
      setCurrentScreen('chat');
      setIsLoading(false);
    };

    // User joined session successfully
    const handleUserJoined = () => {
      if (currentScreen === 'join' && sessionCode) {
        setCurrentScreen('chat');
        setIsLoading(false);
      }
    };

    // Error during session creation/join
    const handleError = (data) => {
      setError(data.message || 'An error occurred');
      setIsLoading(false);
    };

    socket.on(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_CREATED, handleSessionCreated);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [socket, currentScreen, sessionCode]);

  const handleCreateSession = (inputUsername) => {
    setIsLoading(true);
    setError('');
    setUsername(inputUsername);
    
    // If socket is not connected, wait for it
    if (!isConnected) {
      console.log('[APP] Waiting for socket connection before creating session...');
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          clearInterval(checkConnection);
          console.log('[APP] Socket connected, creating session now');
          emit(SOCKET_EVENTS.CREATE_SESSION, { username: inputUsername });
        }
      }, 100);
      
      // Timeout after 5 seconds
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
    
    // If socket is not connected, wait for it
    if (!isConnected) {
      console.log('[APP] Waiting for socket connection before joining session...');
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          clearInterval(checkConnection);
          console.log('[APP] Socket connected, joining session now');
          emit(SOCKET_EVENTS.JOIN_SESSION, { code, username: inputUsername });
        }
      }, 100);
      
      // Timeout after 5 seconds
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
            <span>??</span>
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
