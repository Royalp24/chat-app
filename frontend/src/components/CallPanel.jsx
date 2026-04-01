import { useEffect, useMemo, useRef, useState } from 'react';
import { useCall } from '../contexts/CallContext';
import '../styles/callPanel.css';

function ParticipantVideo({ username, stream, isSelf, isMuted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`participant-video ${isSelf ? 'self' : ''}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className="video-element"
        />
      ) : (
        <div className="video-placeholder">
          <div className="avatar-placeholder">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      {isMuted && (
        <div className="muted-indicator">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
          </svg>
          Muted
        </div>
      )}
      
      <div className="participant-name">
        <span className="participant-status"></span>
        {username} {isSelf && '(You)'}
      </div>
    </div>
  );
}

function CallTimer() {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return <div className="call-duration">{formatTime(duration)}</div>;
}

export default function CallPanel() {
  const { callState, callParticipants, username, localStream, getPeers, isAudioEnabled } = useCall();
  const [viewMode, setViewMode] = useState('grid');

  const gridSize = useMemo(() => {
    const participantCount = callParticipants.length || 1;
    if (participantCount <= 1) return 1;
    if (participantCount <= 2) return 2;
    if (participantCount <= 3) return 3;
    if (participantCount <= 4) return 4;
    if (participantCount <= 6) return 6;
    return 9;
  }, [callParticipants]);

  if (callState !== 'connected') {
    return null;
  }

  const peers = getPeers();
  const allParticipants = [
    { username, stream: localStream, isSelf: true, isMuted: !isAudioEnabled },
    ...callParticipants
      .filter(p => p !== username)
      .map(p => ({
        username: p,
        stream: peers[p]?.stream || null,
        isSelf: false,
        isMuted: false,
      })),
  ];

  return (
    <div className="call-panel-overlay">
      <div className={`call-panel ${viewMode === 'speaker' ? 'speaker-view' : ''}`}>
        <div className="call-header">
          <div>
            <h2>Group Call</h2>
            <span className="participant-count">{allParticipants.length} participants</span>
          </div>
        </div>

        <CallTimer />

        <div className={`video-grid grid-${gridSize}`}>
          {allParticipants.map((participant) => (
            <ParticipantVideo
              key={participant.username}
              username={participant.username}
              stream={participant.stream}
              isSelf={participant.isSelf}
              isMuted={participant.isMuted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
