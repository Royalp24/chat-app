import { useState } from 'react';
import '../styles/forms.css';

export default function JoinSession({ onJoinSession, isLoading }) {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Invitation code is required');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    onJoinSession(code.trim(), username.trim());
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <div className="form-icon">🔗</div>
          <h2>Join Chat Session</h2>
          <p>Enter the invitation code to join an existing chat</p>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="code">Invitation Code</label>
            <input
              type="text"
              id="code"
              className="input-field"
              placeholder="e.g. ABC123xyz!"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
              maxLength={10}
              autoFocus
            />
            <small className="input-hint">Shared by the session creator</small>
          </div>

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
            />
            <small className="input-hint">{username.length}/20 characters</small>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Joining...
              </>
            ) : (
              <>
                <span>🚀</span>
                Join Session
              </>
            )}
          </button>

          <p className="form-info">
            💡 Make sure the session is active and the code is correct.
          </p>
        </form>
      </div>
    </div>
  );
}
