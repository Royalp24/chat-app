import logo from '../assets/LOGO.png';
import '../styles/landing.css';

export default function Landing({ onCreateClick, onJoinClick }) {
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
      <section className="ec-hero">
        <div className="ec-hero-inner">
          <div className="ec-hero-badge">✦ Ephemeral &nbsp;·&nbsp; Private &nbsp;·&nbsp; Real-Time</div>
          <h1 className="ec-hero-title">
            Join.<br />Chat.<br />
            <span className="ec-hero-accent">Disappear.</span>
          </h1>
          <p className="ec-hero-sub">
            Secure, invite-only conversations that vanish the moment the session ends.
            No accounts. No history. No trace.
          </p>
          <div className="ec-hero-actions">
            <button className="ec-btn ec-btn-primary" onClick={onCreateClick}>
              <span>＋</span> Create Chat
            </button>
            <button className="ec-btn ec-btn-outline" onClick={onJoinClick}>
              <span>→</span> Join with Code
            </button>
          </div>
        </div>

        {/* Decorative glow orbs */}
        <div className="ec-orb ec-orb-1" />
        <div className="ec-orb ec-orb-2" />
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
