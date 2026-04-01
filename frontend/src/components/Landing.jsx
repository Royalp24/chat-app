import { useState } from 'react';
import '../styles/landing.css';

export default function Landing({ onCreateClick, onJoinClick }) {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="landing">
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <div className="logo">
            <span className="logo-icon">💬</span>
            <h1>EphemeralChat</h1>
          </div>
          <p className="subtitle">Share conversations, not data. Collaborate temporarily, stay private.</p>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🔐</div>
            <h3>Ephemeral</h3>
            <p>Messages vanish when the session ends</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔗</div>
            <h3>Invite-Only</h3>
            <p>Share a code, not your data</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time</h3>
            <p>Instant messaging with typing indicators</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📥</div>
            <h3>Download</h3>
            <p>Download chat history before session ends</p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="landing-tabs">
          <div className="tabs-buttons">
            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Chat
            </button>
            <button
              className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              Join Chat
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'create' && (
              <div className="tab-pane">
                <h2>Start a New Chat</h2>
                <p>Create an ephemeral chat session and invite others using a secret code.</p>
                <button className="btn btn-primary btn-lg" onClick={onCreateClick}>
                  Create New Chat →
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="tab-pane">
                <h2>Join Existing Chat</h2>
                <p>Have an invitation code? Join an ongoing chat session.</p>
                <button className="btn btn-primary btn-lg" onClick={onJoinClick}>
                  Join with Code →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="landing-footer">
          <div className="info-box">
            <h3>How it works</h3>
            <ol>
              <li>Create or join a session with an invitation code</li>
              <li>Chat in real-time with your collaborators</li>
              <li>Messages are only stored during the active session</li>
              <li>Download chat history before the session ends (creator only)</li>
              <li>Session auto-closes after 40-60 mins of inactivity</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
