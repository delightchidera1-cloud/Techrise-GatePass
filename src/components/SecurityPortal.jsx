import React, { useState } from 'react';
import { ShieldAlert, QrCode, Key, DoorOpen, DoorClosed, Building, MapPin, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function SecurityPortal() {
  const { requests, clockOutParticipant, clockInParticipant, showToast } = useExeat();
  const [searchInput, setSearchInput] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);

  const outsideParticipants = requests.filter(r => r.status === 'ACTIVE_OUTSIDE');
  const validScanPasses = requests.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE_OUTSIDE');

  const handleVerify = () => {
    const code = searchInput.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a valid Pass ID (e.g. GP-8492)', 'error');
      return;
    }
    const match = requests.find(r => r.passId && r.passId.toUpperCase() === code);
    if (!match) {
      showToast(`No pass found matching ID: ${code}`, 'error');
      setVerifiedPass(null);
      return;
    }
    setVerifiedPass(match);
  };

  const handleQuickScan = (passId) => {
    setSearchInput(passId);
    const match = requests.find(r => r.passId === passId);
    if (match) setVerifiedPass(match);
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeOnly = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="security-grid">
      {/* Terminal Card */}
      <div className="card security-terminal-card">
        <div className="terminal-header">
          <ShieldAlert size={32} />
          <div>
            <h3>Gate Verification Terminal</h3>
            <p>Scan QR code or enter Pass ID to clock exit/arrival</p>
          </div>
        </div>

        <div className="scanner-box">
          <div className="scanner-target">
            <QrCode size={64} style={{ opacity: 0.2 }} />
            <div className="laser-beam"></div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>Ready to verify pass</p>
          </div>

          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Pass ID (e.g. GP-8492)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleVerify}>
              <Key size={16} /> Verify
            </button>
          </div>

          <div className="quick-sim-buttons">
            <span>Quick Scan Simulator:</span>
            <div className="tag-cloud">
              {validScanPasses.map(r => (
                <button key={r.id} className="tag-btn" onClick={() => handleQuickScan(r.passId)}>
                  {r.passId} ({r.applicantName.split(' ')[0]})
                </button>
              ))}
              {validScanPasses.length === 0 && (
                <span className="text-muted">No active approved passes</span>
              )}
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verifiedPass && (
          <div className="verification-result-card">
            <div className="result-header">
              <span className={`badge ${
                verifiedPass.status === 'APPROVED' ? 'badge-approved' :
                verifiedPass.status === 'ACTIVE_OUTSIDE' ? (verifiedPass.isOverdue ? 'badge-overdue' : 'badge-active') :
                'badge-completed'
              }`}>
                {verifiedPass.status === 'APPROVED' ? 'VALID FOR EXIT' :
                 verifiedPass.status === 'ACTIVE_OUTSIDE' ? (verifiedPass.isOverdue ? 'OVERDUE RETURN' : 'CURRENTLY OUTSIDE') :
                 'COMPLETED PASS'}
              </span>
              <h4>{verifiedPass.passId}</h4>
            </div>

            <div className="result-details-grid">
              <div>
                <span className="detail-label">Participant:</span>
                <strong>{verifiedPass.applicantName}</strong>
              </div>
              <div>
                <span className="detail-label">Track:</span>
                <span>{verifiedPass.applicantTrack}</span>
              </div>
              <div>
                <span className="detail-label">Destination:</span>
                <span>{verifiedPass.destination}</span>
              </div>
              <div>
                <span className="detail-label">Expected Return:</span>
                <strong>{formatDateTime(verifiedPass.expectedReturnTime)}</strong>
              </div>
            </div>

            <div>
              {verifiedPass.status === 'APPROVED' && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    clockOutParticipant(verifiedPass.id);
                    setVerifiedPass(null);
                    setSearchInput('');
                  }}
                >
                  <DoorOpen size={18} /> CLOCK OUT (MARK DEPARTURE)
                </button>
              )}

              {verifiedPass.status === 'ACTIVE_OUTSIDE' && (
                <button
                  className="btn btn-success"
                  style={{ width: '100%' }}
                  onClick={() => {
                    clockInParticipant(verifiedPass.id);
                    setVerifiedPass(null);
                    setSearchInput('');
                  }}
                >
                  <DoorClosed size={18} /> CLOCK IN (MARK RETURNED)
                </button>
              )}

              {verifiedPass.status === 'COMPLETED' && (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  Pass already completed & returned
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Registry Card */}
      <div className="card security-registry-card">
        <div className="panel-header">
          <div>
            <h3><Building size={20} /> Active Gate Registry</h3>
            <p className="panel-subtitle">Participants currently outside camp gates.</p>
          </div>
          <span className="badge badge-cyan">{outsideParticipants.length} Outside</span>
        </div>

        <div className="active-list">
          {outsideParticipants.map(req => (
            <div key={req.id} className={`active-card-item ${req.isOverdue ? 'overdue-border' : ''}`}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="code-pill">{req.passId}</span>
                  {req.isOverdue ? (
                    <span className="badge badge-overdue"><AlertTriangle size={12} /> OVERDUE</span>
                  ) : (
                    <span className="badge badge-active">OUTSIDE</span>
                  )}
                </div>
                <h4>{req.applicantName} <small style={{ color: '#9ca3af' }}>({req.applicantTrack})</small></h4>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}><MapPin size={12} style={{ display: 'inline' }} /> {req.destination}</p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}><Phone size={12} style={{ display: 'inline' }} /> {req.applicantPhone}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <span className="text-muted" style={{ display: 'block' }}>Departed: {formatTimeOnly(req.actualExitTime)}</span>
                <strong style={{ color: '#06b6d4', display: 'block' }}>Return: {formatTimeOnly(req.expectedReturnTime)}</strong>
                <button
                  className="btn btn-success btn-sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => clockInParticipant(req.id)}
                >
                  Clock In
                </button>
              </div>
            </div>
          ))}

          {outsideParticipants.length === 0 && (
            <div className="empty-state">
              <CheckCircle size={40} />
              <p>All participants are currently inside camp premises!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
