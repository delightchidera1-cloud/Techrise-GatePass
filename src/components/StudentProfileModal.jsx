import React from 'react';
import { useExeat } from '../context/ExeatContext';
import { X, User, Activity, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function StudentProfileModal() {
  const { activeModal, setActiveModal, selectedRequest, requests } = useExeat();

  if (activeModal !== 'studentProfile' || !selectedRequest) return null;

  // We find all requests made by this student
  const studentRequests = requests.filter(r => r.applicantId === selectedRequest.applicantId);
  
  const totalApplied = studentRequests.length;
  const approvedPasses = studentRequests.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE_OUTSIDE' || r.status === 'COMPLETED').length;
  const rejectedPasses = studentRequests.filter(r => r.status === 'REJECTED').length;

  // Calculate defaulted passes (completed late)
  const defaultedPasses = studentRequests.filter(r => {
    if (r.status === 'COMPLETED' && r.expectedReturnTime && r.actualReturnTime) {
      return r.actualReturnTime > r.expectedReturnTime;
    }
    // Also consider currently active and overdue
    if (r.status === 'ACTIVE_OUTSIDE' && r.isOverdue) {
      return true;
    }
    return false;
  });

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3><User size={20} /> Student Profile</h3>
          <button className="btn-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              {selectedRequest.applicantName.charAt(0)}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{selectedRequest.applicantName}</h2>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)' }}>{selectedRequest.applicantId} • {selectedRequest.applicantTrack}</p>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)' }}>Phone: {selectedRequest.applicantPhone || selectedRequest.emergencyContact || 'N/A'}</p>
            </div>
          </div>

          <div className="modal-stats-grid">
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div className="stat-icon icon-purple" style={{ width: '32px', height: '32px' }}><FileText size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Total Applied</span>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{totalApplied}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div className="stat-icon icon-green" style={{ width: '32px', height: '32px' }}><CheckCircle size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Approved</span>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{approvedPasses}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div className="stat-icon icon-red" style={{ width: '32px', height: '32px' }}><XCircle size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Rejected</span>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{rejectedPasses}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div className="stat-icon icon-amber" style={{ width: '32px', height: '32px' }}><AlertTriangle size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Defaulted (Late)</span>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{defaultedPasses.length}</h3>
              </div>
            </div>
          </div>

          {defaultedPasses.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }}/> Default Records
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {defaultedPasses.map(dp => (
                  <li key={dp.id} style={{ padding: '0.75rem', backgroundColor: 'var(--accent-amber-bg)', border: '1px solid var(--accent-amber)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Destination:</strong> {dp.destination} <br/>
                    <strong style={{ color: 'var(--text-main)' }}>Expected Return:</strong> {formatDateTime(dp.expectedReturnTime)} <br/>
                    <strong style={{ color: 'var(--text-main)' }}>Actual Return:</strong> {dp.actualReturnTime ? formatDateTime(dp.actualReturnTime) : 'Not Returned Yet'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--accent-cyan)' }}/> All Applications History
            </h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: 'var(--bg-surface)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Destination</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRequests.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-main)' }}>{formatDateTime(r.createdAt)}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-main)' }}>{r.destination}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.4rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: r.status === 'APPROVED' || r.status === 'COMPLETED' ? 'var(--accent-green-bg)' : r.status === 'REJECTED' ? 'var(--accent-red-bg)' : 'var(--accent-amber-bg)',
                          color: r.status === 'APPROVED' || r.status === 'COMPLETED' ? 'var(--accent-green)' : r.status === 'REJECTED' ? 'var(--accent-red)' : 'var(--accent-amber)'
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
