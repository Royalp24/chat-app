import { useState } from 'react';
import { getInitials, generateColorFromUsername } from '../utils/formatting';
import '../styles/participantList.css';

export default function ParticipantList({ participants, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);

  const listContent = (
    <div className="participants-list">
      {participants.map((participant) => {
        const isCurrentUser = participant === currentUser;
        const bgColor = generateColorFromUsername(participant);

        return (
          <div
            key={participant}
            className={`participant-item ${isCurrentUser ? 'current' : ''}`}
            title={participant}
          >
            <div className="participant-avatar" style={{ backgroundColor: bgColor }}>
              {getInitials(participant)}
            </div>
            <div className="participant-info">
              <p className="participant-name">{participant}</p>
              {isCurrentUser && <span className="current-badge">You</span>}
            </div>
            <div className="participant-status">
              <span className="status-dot online"></span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <div className="participants-sidebar">
        <div className="participants-header">
          <h3>Participants</h3>
          <span className="participant-count">{participants.length}</span>
        </div>
        {listContent}
      </div>

      {/* Mobile: floating toggle button */}
      <button
        className="participants-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle participant list"
        title="Participants"
      >
        👥 <span className="toggle-count">{participants.length}</span>
      </button>

      {/* Mobile: slide-in drawer */}
      {isOpen && (
        <div className="participants-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="participants-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="participants-header drawer-header">
              <h3>Participants</h3>
              <div className="drawer-header-right">
                <span className="participant-count">{participants.length}</span>
                <button
                  className="drawer-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close participant list"
                >
                  ✕
                </button>
              </div>
            </div>
            {listContent}
          </div>
        </div>
      )}
    </>
  );
}
