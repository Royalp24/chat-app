import { useRef, useState, useCallback, useEffect } from 'react';
import { ICE_SERVERS, MEDIA_CONSTRAINTS } from '../utils/webrtcConfig';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export function useWebRTC({ sessionCode, username, emit }) {
   const localStreamRef = useRef(null);
   const peersRef = useRef({});
   const peerConnectionsRef = useRef({});
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
      // Update state to trigger re-render
      setRemoteStreams(prev => ({
        ...prev,
        [targetUsername]: remoteStream,
      }));
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state for', targetUsername, ':', pc.iceConnectionState);
    };

    peerConnectionsRef.current[targetUsername] = pc;
    return pc;
  }, [sessionCode, emit]);

   const handleOffer = useCallback(async (offer, fromUsername) => {
     console.log('[WebRTC] Handling offer from:', fromUsername);
     let pc = peerConnectionsRef.current[fromUsername];
     if (!pc) {
       pc = createPeerConnection(fromUsername);
     }

     await pc.setRemoteDescription(new RTCSessionDescription(offer));
     const answer = await pc.createAnswer();
     await pc.setLocalDescription(answer);

     emit(SOCKET_EVENTS.ANSWER, {
       code: sessionCode,
       answer,
       targetUsername: fromUsername,
     });
   }, [createPeerConnection, emit, sessionCode]);

  const handleAnswer = useCallback(async (answer, fromUsername) => {
    console.log('[WebRTC] Handling answer from:', fromUsername);
    const pc = peerConnectionsRef.current[fromUsername];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate, fromUsername) => {
    const pc = peerConnectionsRef.current[fromUsername];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[WebRTC] Error adding ICE candidate:', error);
      }
    }
  }, []);

   const connectToPeer = useCallback(async (targetUsername) => {
     console.log('[WebRTC] Connecting to peer:', targetUsername);
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
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[targetUsername];
        return next;
      });
    }
  }, []);

  const disconnectAll = useCallback(() => {
    Object.keys(peerConnectionsRef.current).forEach((username) => {
      disconnectFromPeer(username);
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
    // Merge refs with state for up-to-date streams
    const peers = {};
    for (const [username, peer] of Object.entries(peersRef.current)) {
      peers[username] = {
        ...peer,
        stream: remoteStreams[username] || peer.stream,
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
