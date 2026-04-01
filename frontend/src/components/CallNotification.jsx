import { useCall } from '../contexts/CallContext';
import '../styles/callNotification.css';

export default function CallNotification() {
   const { incomingCall, acceptCall, declineCall } = useCall();

   // Only show notification if there's an incoming call (for guests)
   if (!incomingCall) {
     return null;
   }

  return (
    <div className="call-notification-overlay">
      <div className="call-notification">
        <div className="call-notification-icon">
          <span className="pulse-ring"></span>
          <span className="phone-icon">📞</span>
        </div>
        
        <div className="call-notification-content">
          <h3>Incoming Call</h3>
          <p>{incomingCall.initiator} is calling</p>
          <span className="call-info">
            {incomingCall.participants?.length || 0} participant(s) in call
          </span>
        </div>

        <div className="call-notification-actions">
          <button 
            className="btn-call btn-decline" 
            onClick={declineCall}
          >
            <span className="btn-icon">✕</span>
            Decline
          </button>
          <button 
            className="btn-call btn-accept" 
            onClick={acceptCall}
          >
            <span className="btn-icon">✓</span>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
