import { useRef, useState, useCallback, useEffect } from 'react';
import { ICE_SERVERS, MEDIA_CONSTRAINTS } from '../utils/webrtcConfig';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export function useWebRTC({ sessionCode, username, emit }) {
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const peerConnectionsRef = useRef({});
  // Buffer ICE candidates that arrive before setRemoteDescription completes
  const pendingCandidatesRef = useRef({});

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});

  const getLocalStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? MEDIA_CONSTRAINTS.video : false,
        audio: audioEnabled ? MEDIA_CONSTRAINTS.audio : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('[WebRTC] Error getting local stream:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback((targetUsername) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      console.warn('[WebRTC] createPeerConnection called with no local stream for', targetUsername);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit(SOCKET_EVENTS.ICE_CANDIDATE, {
          code: sessionCode,
          candidate: event.candidate,
          targetUsername,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      console.log('[WebRTC] Received remote track from:', targetUsername);
      peersRef.current[targetUsername] = {
        ...peersRef.current[targetUsername],
        stream: remoteStream,
      };
      setRemoteStreams(prev => ({
        ...prev,
        [targetUsername]: remoteStream,
      }));
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state for', targetUsername, ':', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE failed for', targetUsername, '— restarting ICE');
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state for', targetUsername, ':', pc.connectionState);
    };

    peerConnectionsRef.current[targetUsername] = pc;
    return pc;
  }, [sessionCode, emit]);

  // Flush any buffered ICE candidates once remote description is set
  const flushPendingCandidates = useCallback(async (targetUsername) => {
    const pc = peerConnectionsRef.current[targetUsername];
    if (!pc) return;

    const candidates = pendingCandidatesRef.current[targetUsername] || [];
    if (candidates.length === 0) return;

    console.log(`[WebRTC] Flushing ${candidates.length} buffered ICE candidates for`, targetUsername);
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[WebRTC] Error adding buffered ICE candidate:', error);
      }
    }
    pendingCandidatesRef.current[targetUsername] = [];
  }, []);

  // Guest: handle offer from creator
  const handleOffer = useCallback(async (offer, fromUsername) => {
    console.log('[WebRTC] Handling offer from:', fromUsername);
    let pc = peerConnectionsRef.current[fromUsername];
    if (!pc) {
      pc = createPeerConnection(fromUsername);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    // Flush candidates that arrived before remote description was set
    await flushPendingCandidates(fromUsername);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    emit(SOCKET_EVENTS.ANSWER, {
      code: sessionCode,
      answer,
      targetUsername: fromUsername,
    });
  }, [createPeerConnection, flushPendingCandidates, emit, sessionCode]);

  // Creator: handle answer from guest
  const handleAnswer = useCallback(async (answer, fromUsername) => {
    console.log('[WebRTC] Handling answer from:', fromUsername);
    const pc = peerConnectionsRef.current[fromUsername];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      // Flush candidates that arrived before remote description was set
      await flushPendingCandidates(fromUsername);
    }
  }, [flushPendingCandidates]);

  // Buffer ICE candidates if remote description not set yet; add them immediately otherwise
  const handleIceCandidate = useCallback(async (candidate, fromUsername) => {
    const pc = peerConnectionsRef.current[fromUsername];

    if (!pc || !pc.remoteDescription) {
      // Remote description not ready — buffer this candidate
      if (!pendingCandidatesRef.current[fromUsername]) {
        pendingCandidatesRef.current[fromUsername] = [];
      }
      pendingCandidatesRef.current[fromUsername].push(candidate);
      console.log('[WebRTC] Buffered ICE candidate from', fromUsername,
        '(waiting for remote description)');
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }, []);

  // Creator: send offer to a specific peer after stream is confirmed ready
  const connectToPeer = useCallback(async (targetUsername) => {
    console.log('[WebRTC] Connecting to peer:', targetUsername);

    // Safety guard: if stream isn't ready yet, wait briefly and retry once
    if (!localStreamRef.current) {
      console.warn('[WebRTC] Local stream not ready, waiting 500ms before connecting to', targetUsername);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!localStreamRef.current) {
        console.error('[WebRTC] Local stream still not ready, aborting connectToPeer for', targetUsername);
        return;
      }
    }

    let pc = peerConnectionsRef.current[targetUsername];
    if (!pc) {
      pc = createPeerConnection(targetUsername);
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    emit(SOCKET_EVENTS.OFFER, {
      code: sessionCode,
      offer,
      targetUsername,
    });
  }, [createPeerConnection, emit, sessionCode]);

  const disconnectFromPeer = useCallback((targetUsername) => {
    const pc = peerConnectionsRef.current[targetUsername];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[targetUsername];
      delete peersRef.current[targetUsername];
      delete pendingCandidatesRef.current[targetUsername];
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[targetUsername];
        return next;
      });
    }
  }, []);

  const disconnectAll = useCallback(() => {
    Object.keys(peerConnectionsRef.current).forEach((u) => {
      disconnectFromPeer(u);
    });
  }, [disconnectFromPeer]);

  const toggleVideo = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  const toggleAudio = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const getPeers = useCallback(() => {
    const peers = {};
    for (const [u, peer] of Object.entries(peersRef.current)) {
      peers[u] = {
        ...peer,
        stream: remoteStreams[u] || peer.stream,
      };
    }
    return peers;
  }, [remoteStreams]);

  useEffect(() => {
    return () => {
      disconnectAll();
      stopLocalStream();
    };
  }, [disconnectAll, stopLocalStream]);

  return {
    localStream,
    localStreamRef,
    peerConnectionsRef,
    getLocalStream,
    createPeerConnection,
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
  };
}
