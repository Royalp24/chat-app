import { formatTime, generateColorFromUsername } from '../utils/formatting';
import '../styles/messageBubble.css';

export default function MessageBubble({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
}) {
  const handleEdit = () => {
    const newText = prompt('Edit message:', message.text);
    if (newText && newText.trim() && newText !== message.text) {
      onEdit(message.id, newText.trim());
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this message?')) {
      onDelete(message.id);
    }
  };

  const bgColor = generateColorFromUsername(message.username);

  if (message.deleted) {
    return (
      <div className={`message-group ${isOwnMessage ? 'own' : 'other'}`}>
        <div className="message-bubble deleted">
          <em>This message was deleted</em>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-group ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-content">
        {!isOwnMessage && <div className="message-username">{message.username}</div>}

        <div className="message-bubble" style={isOwnMessage ? {} : { borderLeftColor: bgColor }}>
          <div className="message-text">{message.text}</div>
          {message.edited && <span className="message-edited">edited</span>}
        </div>

        <div className="message-meta">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isOwnMessage && (
            <div className="message-actions">
              <button
                className="msg-action-btn"
                title="Edit"
                onClick={handleEdit}
              >
                ✏️
              </button>
              <button
                className="msg-action-btn"
                title="Delete"
                onClick={handleDelete}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
