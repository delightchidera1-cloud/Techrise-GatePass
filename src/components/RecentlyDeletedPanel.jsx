import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertOctagon, User } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function RecentlyDeletedPanel() {
  const { deletedUsers, restoreUser, permanentlyDeleteUser } = useExeat();
  const [processingId, setProcessingId] = useState(null);

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

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this account? This action cannot be undone.")) {
      setProcessingId(userId);
      await permanentlyDeleteUser(userId);
      setProcessingId(null);
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
    </div>
  );
}
