import React, { useState } from 'react';
import { Search, ListChecks, QrCode, Lock, MapPin, FolderOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function ParticipantPortal() {
  const { requests, currentUser, setActiveModal, setSelectedRequest } = useExeat();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter requests for logged in student or show all if previewing
  const filtered = requests.filter(req => {
    let matchesUser = true;
    if (currentUser && currentUser.role === 'participant') {
      matchesUser = (req.applicantId === currentUser.studentId) ||
                    (req.applicantName.toLowerCase() === currentUser.name.toLowerCase());
    }

    const matchesSearch = req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.reasonCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (req.passId && req.passId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesFilter = true;
    if (statusFilter === 'OVERDUE') {
      matchesFilter = req.isOverdue;
    } else if (statusFilter !== 'ALL') {
      matchesFilter = req.status === statusFilter;
    }

    return matchesUser && matchesSearch && matchesFilter;
  });

  const getStatusBadge = (req) => {
    if (req.isOverdue) {
      return <span className="badge badge-overdue"><AlertTriangle size={12} /> OVERDUE RETURN</span>;
    }
    switch (req.status) {
      case 'PENDING':
        return <span className="badge badge-pending"><Clock size={12} /> PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span className="badge badge-approved"><CheckCircle size={12} /> APPROVED PASS</span>;
      case 'ACTIVE_OUTSIDE':
        return <span className="badge badge-active"><CheckCircle size={12} /> OUTSIDE CAMP</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">RETURNED</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">REJECTED</span>;
      default:
        return <span className="badge badge-pending">{req.status}</span>;
    }
  };

  const handleOpenPass = (req) => {
    setSelectedRequest(req);
    setActiveModal('digitalPass');
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card panel-header-card">
      <div className="panel-header">
        <h3><ListChecks size={20} /> My Permission Applications</h3>
        <div className="search-filter-group">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search destination, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved Passes</option>
            <option value="ACTIVE_OUTSIDE">Active Outside</option>
            <option value="COMPLETED">Completed/Returned</option>
            <option value="REJECTED">Rejected</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pass ID</th>
              <th>Reason & Destination</th>
              <th>Exit Schedule</th>
              <th>Expected Return</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(req => (
              <tr key={req.id}>
                <td>
                  {req.passId ? <span className="code-pill">{req.passId}</span> : <span className="text-muted">N/A</span>}
                </td>
                <td>
                  <strong>{req.reasonCategory}</strong><br />
                  <small className="text-muted"><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {req.destination}</small>
                </td>
                <td>{formatDateTime(req.exitTime)}</td>
                <td>{formatDateTime(req.expectedReturnTime)}</td>
                <td>{getStatusBadge(req)}</td>
                <td>
                  {(req.status === 'APPROVED' || req.status === 'ACTIVE_OUTSIDE' || req.status === 'COMPLETED') ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleOpenPass(req)}>
                      <QrCode size={14} /> View Pass
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled>
                      <Lock size={14} /> Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <FolderOpen size={40} />
            <p>No applications match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
