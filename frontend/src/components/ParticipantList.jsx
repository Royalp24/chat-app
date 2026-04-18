import { getInitials, generateColorFromUsername } from '../utils/formatting';
import '../styles/participantList.css';

export default function ParticipantList({ participants, currentUser, mobileOpen, onMobileClose }) {
  const listContent = (
    <div className="participants-list">
      {participants.map((participant) => {
        const isCurrentUser = participant === currentUser;
        const bgColor = generateColorFromUsername(participant);

        return (
          <div
            key={participant}
            className={`participant-item ${isCurrentUser ? 'current' : ''}`}
          >
            <div className="participant-avatar" style={{ backgroundColor: bgColor }}>
              {getInitials(participant)}
            </div>
            <div className="participant-info">
              <p className="participant-username">{participant}</p>
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

      {/* Mobile: slide-in drawer (controlled by parent) */}
      {mobileOpen && (
        <div className="participants-drawer-overlay" onClick={onMobileClose}>
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
                  onClick={onMobileClose}
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
