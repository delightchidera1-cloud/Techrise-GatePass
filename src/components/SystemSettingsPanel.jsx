import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function SystemSettingsPanel() {
  const { startNewCohort } = useExeat();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isWiping, setIsWiping] = useState(false);

  const handleWipeData = async () => {
    if (confirmText !== 'START NEW COHORT') return;
    
    setIsWiping(true);
    await startNewCohort();
    setIsWiping(false);
    setShowModal(false);
    setConfirmText('');
  };

  return (
    <div className="card panel-header-card" style={{ marginTop: '2rem' }}>
      <div className="panel-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
            <SettingsIcon /> System Settings
          </h3>
          <p className="panel-subtitle">Manage advanced platform configurations.</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Danger Zone */}
        <div style={{ border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <h4 style={{ color: '#ef4444', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Danger Zone: Start New Cohort
          </h4>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            Executing this action will <strong>permanently delete all student records, gatepass requests, and attendance history</strong> from the database. 
            Facilitators, Admins, and Security accounts will be kept intact. This cannot be undone.
          </p>
          
          <button 
            className="btn btn-danger" 
            onClick={() => setShowModal(true)}
            style={{ fontWeight: 'bold' }}
          >
            <Trash2 size={18} style={{ marginRight: '8px' }} /> Initialize Factory Reset
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} /> Extreme Caution Required
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-content" style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                You are about to wipe the database and start a new cohort. This will delete all <strong>Students, Gatepass Requests, and Attendance Records</strong> permanently.
              </p>
              <p style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                This action is irreversible.
              </p>

              <div className="form-group">
                <label>Please type <strong>START NEW COHORT</strong> to confirm.</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="START NEW COHORT"
                  style={{ marginTop: '0.5rem', border: '1px solid #ef4444' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  disabled={confirmText !== 'START NEW COHORT' || isWiping}
                  onClick={handleWipeData}
                >
                  {isWiping ? 'Wiping Database...' : 'Permanently Delete Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline icon component since Settings might conflict with other imports if imported at top
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
