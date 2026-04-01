import { getInitials, generateColorFromUsername } from '../utils/formatting';
import '../styles/participantList.css';

export default function ParticipantList({ participants, currentUser }) {
  return (
    <div className="participants-sidebar">
      <div className="participants-header">
        <h3>Participants</h3>
        <span className="participant-count">{participants.length}</span>
      </div>

      <div className="participants-list">
        {participants.map((participant) => {
          const isCurrentUser = participant === currentUser;
          const bgColor = generateColorFromUsername(participant);

          return (
            <div key={participant} className={`participant-item ${isCurrentUser ? 'current' : ''}`}>
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
    </div>
  );
}
