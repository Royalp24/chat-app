import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';
import { useWebRTC } from '../hooks/useWebRTC';

const CallContext = createContext(null);

export function CallProvider({ children, sessionCode, username }) {
   const { socket, emit } = useSocket();
   
   const [callState, setCallState] = useState('idle');
   const [callError, setCallError] = useState(null);
   
   // Store username in state so it's accessible throughout the context
   const [currentUsername] = useState(username);
   const [currentCall, setCurrentCall] = useState(null);
   const [incomingCall, setIncomingCall] = useState(null);
   const [callParticipants, setCallParticipants] = useState([]);
   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
   // eslint-disable-next-line no-unused-vars
   const [isScreenSharing, setIsScreenSharing] = useState(false);

  const {
    localStream,
    getLocalStream,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectToPeer,
    disconnectFromPeer,
    disconnectAll,
    toggleVideo,
    toggleAudio,
    stopLocalStream,
    getPeers,
  } = useWebRTC({ sessionCode, username, emit });

   const initiateCall = useCallback(async () => {
     try {
       setCallError(null);
       await getLocalStream(true, true);
       // Add creator to participants list
       setCallParticipants([currentUsername]);
       setCallState('connected');
       emit(SOCKET_EVENTS.CALL_INITIATED, { code: sessionCode });
     } catch (error) {
       console.error('[Call] Error initiating call:', error);
       let errorMessage = 'Failed to start call';
       
       if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
         errorMessage = 'Camera/microphone access denied. Please check your browser permissions.';
       } else if (error.name === 'NotFoundError') {
         errorMessage = 'No camera/microphone found on this device.';
       } else if (error.name === 'NotReadableError') {
         errorMessage = 'Camera/microphone is already in use by another application.';
       }
       
       setCallError(errorMessage);
       setCallState('idle');
     }
   }, [getLocalStream, emit, sessionCode, currentUsername]);

   const acceptCall = useCallback(async () => {
     try {
       setCallError(null);
       await getLocalStream(true, true);
       setCallState('connected');
       
       emit(SOCKET_EVENTS.CALL_ACCEPTED, {
         code: sessionCode,
         callId: incomingCall.callId,
       });

       setIncomingCall(null);
     } catch (error) {
       console.error('[Call] Error accepting call:', error);
       let errorMessage = 'Failed to accept call';
       
       if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
         errorMessage = 'Camera/microphone access denied. Please check your browser permissions.';
       } else if (error.name === 'NotFoundError') {
         errorMessage = 'No camera/microphone found on this device.';
       } else if (error.name === 'NotReadableError') {
         errorMessage = 'Camera/microphone is already in use by another application.';
       }
       
       setCallError(errorMessage);
       setCallState('idle');
     }
   }, [getLocalStream, emit, sessionCode, incomingCall]);

  const declineCall = useCallback(() => {
    if (incomingCall) {
      emit(SOCKET_EVENTS.CALL_DECLINED, {
        code: sessionCode,
        callId: incomingCall.callId,
      });
      setIncomingCall(null);
    }
  }, [emit, sessionCode, incomingCall]);

   const endCall = useCallback(() => {
     emit(SOCKET_EVENTS.CALL_ENDED, { code: sessionCode });
     disconnectAll();
     stopLocalStream();
     setCallState('idle');
     setCurrentCall(null);
     setCallParticipants([]);
     setIsVideoEnabled(true);
     setIsAudioEnabled(true);
     setCallError(null);
   }, [emit, sessionCode, disconnectAll, stopLocalStream]);

  const handleCallInvitation = useCallback((data) => {
    setIncomingCall(data);
  }, []);

  const handleCallParticipantJoined = useCallback((data) => {
    setCallParticipants(data.participants);
    
    if (callState === 'connected') {
      const newParticipants = data.participants.filter(
        p => !getPeers()[p] && p !== username
      );
      newParticipants.forEach(p => connectToPeer(p));
    }
  }, [callState, getPeers, connectToPeer, username]);

  const handleCallParticipantLeft = useCallback((data) => {
    setCallParticipants(data.participants || []);
    disconnectFromPeer(data.username);
  }, [disconnectFromPeer]);

  const handleCallEnded = useCallback(() => {
    disconnectAll();
    stopLocalStream();
    setCallState('idle');
    setCurrentCall(null);
    setCallParticipants([]);
    setIncomingCall(null);
  }, [disconnectAll, stopLocalStream]);

  const handleCallDeclined = useCallback(() => {
    if (callState === 'calling') {
      endCall();
    }
  }, [callState, endCall]);

  const handleOfferSignal = useCallback(async (data) => {
    await handleOffer(data.offer, data.fromUsername);
  }, [handleOffer]);

  const handleAnswerSignal = useCallback(async (data) => {
    await handleAnswer(data.answer, data.fromUsername);
  }, [handleAnswer]);

  const handleIceCandidateSignal = useCallback(async (data) => {
    await handleIceCandidate(data.candidate, data.fromUsername);
  }, [handleIceCandidate]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.CALL_INVITATION, handleCallInvitation);
    socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_JOINED, handleCallParticipantJoined);
    socket.on(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, handleCallParticipantLeft);
    socket.on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    socket.on(SOCKET_EVENTS.CALL_DECLINED, handleCallDeclined);
    socket.on(SOCKET_EVENTS.OFFER, handleOfferSignal);
    socket.on(SOCKET_EVENTS.ANSWER, handleAnswerSignal);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidateSignal);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_INVITATION, handleCallInvitation);
      socket.off(SOCKET_EVENTS.CALL_PARTICIPANT_JOINED, handleCallParticipantJoined);
      socket.off(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, handleCallParticipantLeft);
      socket.off(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
      socket.off(SOCKET_EVENTS.CALL_DECLINED, handleCallDeclined);
      socket.off(SOCKET_EVENTS.OFFER, handleOfferSignal);
      socket.off(SOCKET_EVENTS.ANSWER, handleAnswerSignal);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidateSignal);
    };
  }, [
    socket,
    handleCallInvitation,
    handleCallParticipantJoined,
    handleCallParticipantLeft,
    handleCallEnded,
    handleCallDeclined,
    handleOfferSignal,
    handleAnswerSignal,
    handleIceCandidateSignal,
  ]);

  useEffect(() => {
    if (callState === 'connected' && callParticipants.length > 0) {
      callParticipants
        .filter(p => p !== username)
        .forEach(async (participant) => {
          if (!getPeers()[participant]) {
            await connectToPeer(participant);
          }
        });
    }
  }, [callState, callParticipants, username, getPeers, connectToPeer]);

  const toggleVideoEnabled = useCallback(() => {
    toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(prev => !prev);
  }, [toggleVideo, isVideoEnabled]);

  const toggleAudioEnabled = useCallback(() => {
    toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(prev => !prev);
  }, [toggleAudio, isAudioEnabled]);

   const value = {
     callState,
     callError,
     currentCall,
     incomingCall,
     callParticipants,
     isVideoEnabled,
     isAudioEnabled,
     isScreenSharing,
     localStream,
     username: currentUsername,
     getPeers,
     initiateCall,
     acceptCall,
     declineCall,
     endCall,
     toggleVideoEnabled,
     toggleAudioEnabled,
     setCallState,
     setCurrentCall,
     setCallParticipants,
   };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
