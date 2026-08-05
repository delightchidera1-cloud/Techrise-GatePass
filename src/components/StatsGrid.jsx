import React from 'react';
import { FileSignature, Clock, IdCard, UserCheck, AlertTriangle, CheckCheck } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function StatsGrid() {
  const { requests, activeRole, currentUser } = useExeat();

  let relevantRequests = requests;
  if (activeRole === 'participant' && currentUser) {
    relevantRequests = requests.filter(r => r.applicantId === currentUser.studentId);
  }

  const total = relevantRequests.length;
  const pending = relevantRequests.filter(r => r.status === 'PENDING').length;
  const approved = relevantRequests.filter(r => ['APPROVED', 'ACTIVE_OUTSIDE', 'COMPLETED'].includes(r.status)).length;
  const activeOut = relevantRequests.filter(r => r.status === 'ACTIVE_OUTSIDE').length;
  const overdue = relevantRequests.filter(r => r.isOverdue).length;
  const totalIssued = relevantRequests.filter(r => r.passId !== null).length;

  if (activeRole === 'admin' || activeRole === 'superadmin') {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-amber"><Clock size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Awaiting Approval</span>
            <h3>{pending}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div class="stat-icon icon-cyan"><UserCheck size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Participants Out of Camp</span>
            <h3>{activeOut}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red"><AlertTriangle size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Overdue Returns</span>
            <h3>{overdue}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><CheckCheck size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Total Passes Issued</span>
            <h3>{totalIssued}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'security') {
    return (
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon icon-cyan"><UserCheck size={24} /></div>
          <div className="stat-details">
            <span className="stat-label">Currently Outside</span>
            <h3>{activeOut}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon icon-purple"><FileSignature size={24} /></div>
        <div className="stat-details">
          <span className="stat-label">Total Requests</span>
          <h3>{total}</h3>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon icon-amber"><Clock size={24} /></div>
        <div className="stat-details">
          <span className="stat-label">Pending Approval</span>
          <h3>{pending}</h3>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon icon-green"><IdCard size={24} /></div>
        <div className="stat-details">
          <span className="stat-label">Approved Passes</span>
          <h3>{approved}</h3>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon icon-cyan"><UserCheck size={24} /></div>
        <div className="stat-details">
          <span className="stat-label">Currently Outside</span>
          <h3>{activeOut}</h3>
        </div>
      </div>
    </div>
  );
}
