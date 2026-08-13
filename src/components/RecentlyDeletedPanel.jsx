import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, RotateCcw, AlertOctagon, User, ShieldAlert } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function RecentlyDeletedPanel() {
  const { deletedUsers, restoreUser, permanentlyDeleteUser } = useExeat();
  const [processingId, setProcessingId] = useState(null);
  const [userToPurge, setUserToPurge] = useState(null);

  const calculateDaysLeft = (deletedAt) => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const diffTime = Math.abs(now - deletedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - diffDays);
  };

  const handleRestore = async (userId) => {
    setProcessingId(userId);
    await restoreUser(userId);
    setProcessingId(null);
  };

  const handleDelete = (userId) => {
    const user = deletedUsers.find(u => u.id === userId);
    setUserToPurge(user);
  };

  const confirmPurgeUser = async () => {
    if (userToPurge) {
      setProcessingId(userToPurge.id);
      await permanentlyDeleteUser(userToPurge.id);
      setProcessingId(null);
      setUserToPurge(null);
    }
  };

  return (
    <div className="card panel-header-card" style={{ marginTop: '2rem' }}>
      <div className="panel-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <Trash2 size={20} /> Recently Deleted Accounts
          </h3>
          <p className="panel-subtitle">Accounts listed here will be permanently deleted after 15 days.</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {deletedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <AlertOctagon size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p>No recently deleted accounts found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ backgroundColor: 'var(--bg-surface)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>User Details</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Time Left</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{u.name}</strong>
                      <br />
                      <small className="text-muted">{u.email}</small>
                      {u.studentId && <><br /><small className="code-pill" style={{ marginTop: '4px', display: 'inline-block' }}>{u.studentId}</small></>}
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      <span className="badge badge-pending" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text)' }}>
                        <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {u.role === 'participant' ? 'Student' : u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                        {calculateDaysLeft(u.deletedAt)} Days
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-sm btn-outline"
                          disabled={processingId === u.id}
                          onClick={() => handleRestore(u.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          disabled={processingId === u.id}
                          onClick={() => handleDelete(u.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} /> Purge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purge Confirmation Modal */}
      {userToPurge && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <ShieldAlert size={20} /> Permanently Delete User
              </h3>
              <button className="modal-close" onClick={() => setUserToPurge(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to PERMANENTLY delete <strong>{userToPurge.name}</strong>?
              </p>
              <p style={{ marginBottom: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                This action cannot be undone.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setUserToPurge(null)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  disabled={processingId === userToPurge.id}
                  onClick={confirmPurgeUser}
                >
                  {processingId === userToPurge.id ? 'Purging...' : 'Yes, Purge User'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
