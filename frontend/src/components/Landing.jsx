import { useState } from 'react';
import logo from '../assets/LOGO.png';
import '../styles/landing.css';

export default function Landing({ onCreateClick, onJoinClick }) {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="ec-navbar">
        <div className="ec-navbar-brand">
          <img src={logo} alt="EphemChat logo" className="ec-nav-logo" />
          <span className="ec-nav-name">EphemChat</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="ec-hero">
        <div className="ec-hero-inner">
          <div className="ec-hero-badge">✦ Ephemeral &nbsp;·&nbsp; Private &nbsp;·&nbsp; Real-Time</div>
          <h1 className="ec-hero-title">
            Join.<br />Chat.<br />
            <span className="ec-hero-accent">Disappear.</span>
          </h1>

        </div>

        {/* Decorative glow orbs */}
        <div className="ec-orb ec-orb-1" />
        <div className="ec-orb ec-orb-2" />
      </header>

      {/* ── Features Grid ── */}
      <section className="ec-features-section">
        <div className="ec-features-grid">
          <div className="ec-feature">
            <div className="ec-feature-icon">🔐</div>
            <h3>Ephemeral</h3>
            <p>Messages vanish completely when the session ends. No logs.</p>
          </div>
          <div className="ec-feature">
            <div className="ec-feature-icon">🔗</div>
            <h3>Invite-Only</h3>
            <p>Share a code, not your data. Total anonymity maintained.</p>
          </div>
          <div className="ec-feature">
            <div className="ec-feature-icon">⚡</div>
            <h3>Real-Time</h3>
            <p>Instant messaging with live typing indicators and speed.</p>
          </div>
          <div className="ec-feature">
            <div className="ec-feature-icon">📥</div>
            <h3>Download</h3>
            <p>Save chat history before the session explicitly terminates.</p>
          </div>
        </div>
      </section>

      {/* ── Action Tabs ── */}
      <section className="ec-tabs-section">
        <div className="ec-tabs-container">
          <div className="ec-tabs-header">
            <button
              className={`ec-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Chat
            </button>
            <button
              className={`ec-tab-btn ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              Join Chat
            </button>
          </div>

          <div className="ec-tabs-content">
            {activeTab === 'create' && (
              <div className="ec-tab-pane animate-fade-in">
                <h2>Start a New Chat</h2>
                <p>Launch an ephemeral chat session and invite your collaborators using a secure secret code.</p>
                <button className="ec-btn ec-btn-primary ec-btn-large" onClick={onCreateClick}>
                  <span>＋</span> Create New Chat
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="ec-tab-pane animate-fade-in">
                <h2>Join Existing Chat</h2>
                <p>Have an invitation code? Enter the active session and start communicating securely.</p>
                <button className="ec-btn ec-btn-primary ec-btn-large" onClick={onJoinClick}>
                  <span>→</span> Join with Code
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="ec-how">
        <div className="ec-how-inner">
          <p className="ec-section-label">How it works</p>
          <h2 className="ec-section-title">Simple. Private. Ephemeral.</h2>

          <div className="ec-steps">
            <div className="ec-step">
              <div className="ec-step-num">01</div>
              <div className="ec-step-icon">🔐</div>
              <h3>Create a Session</h3>
              <p>Start an ephemeral chat room and get a unique invite code instantly.</p>
            </div>
            <div className="ec-step-divider" />
            <div className="ec-step">
              <div className="ec-step-num">02</div>
              <div className="ec-step-icon">🔗</div>
              <h3>Share the Code</h3>
              <p>Send the code to anyone you want — no signup or account needed.</p>
            </div>
            <div className="ec-step-divider" />
            <div className="ec-step">
              <div className="ec-step-num">03</div>
              <div className="ec-step-icon">⚡</div>
              <h3>Chat in Real-Time</h3>
              <p>Instant messaging with live typing indicators and voice calls.</p>
            </div>
            <div className="ec-step-divider" />
            <div className="ec-step">
              <div className="ec-step-num">04</div>
              <div className="ec-step-icon">💨</div>
              <h3>Disappear</h3>
              <p>Session ends — all messages vanish forever. No logs, no data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ec-footer">
        <div className="ec-footer-brand">
          <img src={logo} alt="EphemChat" className="ec-footer-logo" />
          <span className="ec-footer-name">EphemChat</span>
        </div>
        <p className="ec-footer-tagline">Join. Chat. Disappear.</p>
        <p className="ec-footer-copy">© 2025 EphemChat · All conversations are ephemeral</p>
      </footer>

    </div>
  );
}
