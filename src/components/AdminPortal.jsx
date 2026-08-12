import React, { useState } from 'react';
import { UserCheck, FileSpreadsheet, Database, Search, Check, X, MapPin, Phone, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function AdminPortal() {
  const { requests, exportToCSV, setActiveModal, setSelectedRequest, currentUser, users } = useExeat();
  const [historySearch, setHistorySearch] = useState('');

  const canSeeRequest = (req) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin' || currentUser.canApproveAll) return true;
    
    const applicant = users.find(u => u.studentId === req.applicantId);
    return applicant && applicant.assignedTutorId === currentUser.id;
  };

  const pendingList = requests.filter(r => r.status === 'PENDING' && canSeeRequest(r));

  const historyList = requests.filter(r => 
    canSeeRequest(r) &&
    (r.applicantName.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.applicantId.toLowerCase().includes(historySearch.toLowerCase()) ||
    (r.passId && r.passId.toLowerCase().includes(historySearch.toLowerCase())) ||
    r.destination.toLowerCase().includes(historySearch.toLowerCase()))
  );

  const displayedHistoryList = historySearch.trim() === '' ? historyList.slice(0, 10) : historyList;

  const handleActionClick = (req, actionType) => {
    setSelectedRequest({ ...req, actionType });
    setActiveModal('adminAction');
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (req) => {
    if (req.isOverdue) return <span className="badge badge-overdue"><AlertTriangle size={12} /> OVERDUE</span>;
    switch (req.status) {
      case 'PENDING': return <span className="badge badge-pending"><Clock size={12} /> PENDING</span>;
      case 'APPROVED': return <span className="badge badge-approved"><CheckCircle size={12} /> APPROVED</span>;
      case 'ACTIVE_OUTSIDE': return <span className="badge badge-active">OUTSIDE</span>;
      case 'COMPLETED': return <span className="badge badge-completed">RETURNED</span>;
      case 'REJECTED': return <span className="badge badge-rejected">REJECTED</span>;
      default: return <span className="badge badge-pending">{req.status}</span>;
    }
  };

  return (
    <div>
      {/* Pending Queue Panel */}
      <div className="card panel-header-card" style={{ marginBottom: '1.75rem' }}>
        <div className="panel-header">
          <div>
            <h3><UserCheck size={20} /> Pending Permission Queue</h3>
            <p className="panel-subtitle">Review applications from participants and grant or decline permission to leave gate.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>
            <FileSpreadsheet size={14} /> Export Exeat Log (CSV)
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Track / Dept</th>
                <th>Reason & Destination</th>
                <th>Schedule</th>
                <th>Emergency Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map(req => (
                <tr key={req.id}>
                  <td>
                    <button 
                      style={{ padding: 0, textAlign: 'left', fontWeight: 'bold', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { setSelectedRequest(req); setActiveModal('studentProfile'); }}
                    >
                      {req.applicantName}
                    </button><br />
                    <small className="code-pill">{req.applicantId}</small>
                  </td>
                  <td>{req.applicantTrack}</td>
                  <td>
                    <strong>{req.reasonCategory}</strong><br />
                    <small className="text-muted"><MapPin size={12} style={{ display: 'inline' }} /> {req.destination}</small>
                    {req.detailedReason && <br />}
                    {req.detailedReason && <small className="text-muted">"{req.detailedReason}"</small>}
                  </td>
                  <td>
                    <small>Exit: {formatDateTime(req.exitTime)}</small><br />
                    <small>Return: {formatDateTime(req.expectedReturnTime)}</small>
                  </td>
                  <td><small><Phone size={12} style={{ display: 'inline' }} /> {req.emergencyContact}</small></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleActionClick(req, 'APPROVE')}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleActionClick(req, 'REJECT')}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingList.length === 0 && (
            <div className="empty-state">
              <CheckCircle size={40} />
              <p>No pending applications awaiting approval right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Registry Panel */}
      <div className="card panel-header-card">
        <div className="panel-header">
          <h3><Database size={20} /> All Exeat Records & History</h3>
          <div className="search-filter-group">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search participant name, ID..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Participant</th>
                <th>Destination</th>
                <th>Exit Schedule</th>
                <th>Return Schedule</th>
                <th>Status</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistoryList.map(req => (
                <tr key={req.id}>
                  <td>{req.passId ? <span className="code-pill">{req.passId}</span> : <span className="text-muted">N/A</span>}</td>
                  <td>
                    <button 
                      style={{ padding: 0, textAlign: 'left', fontWeight: 'bold', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { setSelectedRequest(req); setActiveModal('studentProfile'); }}
                    >
                      {req.applicantName}
                    </button> ({req.applicantId})
                  </td>
                  <td>{req.destination}</td>
                  <td>{formatDateTime(req.exitTime)}</td>
                  <td>{formatDateTime(req.expectedReturnTime)}</td>
                  <td>{getStatusBadge(req)}</td>
                  <td><small>{req.approvedBy || 'N/A'}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
