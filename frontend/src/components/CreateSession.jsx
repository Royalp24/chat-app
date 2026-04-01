import { useState } from 'react';
import '../styles/forms.css';

export default function CreateSession({ onCreateSession, isLoading }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    onCreateSession(username.trim());
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <div className="form-icon">💬</div>
          <h2>Create New Chat</h2>
          <p>Start a temporary chat session and share the code with others</p>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Your Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Enter your name or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              maxLength={20}
              autoFocus
            />
            <small className="input-hint">{username.length}/20 characters</small>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <span>✨</span>
                Create Session
              </>
            )}
          </button>

          <p className="form-info">
            💡 You'll be the session creator. You can invite others using the generated code.
          </p>
        </form>
      </div>
    </div>
  );
}
