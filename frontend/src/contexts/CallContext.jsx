import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';
import { useWebRTC } from '../hooks/useWebRTC';

const CallContext = createContext(null);

export function CallProvider({ children, sessionCode, username, isCreator }) {
  const { socket, emit } = useSocket();

  const [callState, setCallState] = useState('idle');
  const [callError, setCallError] = useState(null);
  const callStateRef = useRef('idle');

  const [currentUsername] = useState(username);
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callParticipants, setCallParticipants] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const setCallStateSync = useCallback((state) => {
    callStateRef.current = state;
    setCallState(state);
  }, []);

  const {
    localStream,
    peerConnectionsRef,
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
      setCallParticipants([currentUsername]);
      setCallStateSync('connected');
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
      setCallStateSync('idle');
    }
  }, [getLocalStream, emit, sessionCode, currentUsername, setCallStateSync]);

  const acceptCall = useCallback(async () => {
    try {
      setCallError(null);
      await getLocalStream(true, true);
      setCallStateSync('connected');

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
      setCallStateSync('idle');
    }
  }, [getLocalStream, emit, sessionCode, incomingCall, setCallStateSync]);

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
    setCallStateSync('idle');
    setCurrentCall(null);
    setCallParticipants([]);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallError(null);
  }, [emit, sessionCode, disconnectAll, stopLocalStream, setCallStateSync]);

  const leaveCall = useCallback(() => {
    emit(SOCKET_EVENTS.CALL_PARTICIPANT_LEFT, { code: sessionCode, username: currentUsername });
    disconnectAll();
    stopLocalStream();
    setCallStateSync('idle');
    setCurrentCall(null);
    setCallParticipants([]);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallError(null);
  }, [emit, sessionCode, currentUsername, disconnectAll, stopLocalStream, setCallStateSync]);

  const handleCallInvitation = useCallback((data) => {
    setIncomingCall(data);
  }, []);

  const handleCallParticipantJoined = useCallback((data) => {
    setCallParticipants(data.participants);

    // Only the CREATOR sends offers to new participants.
    // Guests wait to receive the offer from the creator and respond with an answer.
    // If both sides call connectToPeer simultaneously, offers collide and the
    // connection dies. The creator is always the polite offerer.
    if (isCreator && callStateRef.current === 'connected') {
      const newParticipants = data.participants.filter(
        p => !peerConnectionsRef.current[p] && p !== username
      );
      console.log('[CALL] Creator connecting to new participants:', newParticipants);
      newParticipants.forEach(p => connectToPeer(p));
    }
  }, [isCreator, peerConnectionsRef, connectToPeer, username]);

  const handleCallParticipantLeft = useCallback((data) => {
    setCallParticipants(data.participants || []);
    disconnectFromPeer(data.username);
  }, [disconnectFromPeer]);

  const handleCallEnded = useCallback(() => {
    disconnectAll();
    stopLocalStream();
    setCallStateSync('idle');
    setCurrentCall(null);
    setCallParticipants([]);
    setIncomingCall(null);
  }, [disconnectAll, stopLocalStream, setCallStateSync]);

  const handleCallDeclined = useCallback(() => {
    if (callStateRef.current === 'calling') {
      endCall();
    }
  }, [endCall]);

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

  // NOTE: Peer connection initiation is handled exclusively in handleCallParticipantJoined
  // by the creator. The duplicate useEffect that was here caused offer collisions.

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
    isCreator,
    getPeers,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    leaveCall,
    toggleVideoEnabled,
    toggleAudioEnabled,
    setCallState: setCallStateSync,
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
