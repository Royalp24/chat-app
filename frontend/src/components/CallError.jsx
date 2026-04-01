import { useCall } from '../contexts/CallContext';
import '../styles/callError.css';

export default function CallError() {
  const { callError } = useCall();

  if (!callError) {
    return null;
  }

  return (
    <div className="call-error-banner">
      <div className="call-error-content">
        <span className="error-icon">⚠️</span>
        <p className="error-message">{callError}</p>
      </div>
    </div>
  );
}
