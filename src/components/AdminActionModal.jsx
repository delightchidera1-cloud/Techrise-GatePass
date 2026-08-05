import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function AdminActionModal() {
  const { activeModal, setActiveModal, selectedRequest, approveRequest, rejectRequest } = useExeat();
  const [comment, setComment] = useState('');

  if (activeModal !== 'adminAction' || !selectedRequest) return null;

  const req = selectedRequest;
  const isApprove = req.actionType === 'APPROVE';

  const handleSubmit = () => {
    if (isApprove) {
      approveRequest(req.id, comment);
    } else {
      rejectRequest(req.id, comment);
    }
    setActiveModal(null);
    setComment('');
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            {isApprove ? (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={20} /> Approve Exeat Request
              </span>
            ) : (
              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={20} /> Reject Exeat Request
              </span>
            )}
          </h3>
          <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="applicant-summary-box">
            <strong>Applicant:</strong> {req.applicantName} ({req.applicantId})<br />
            <strong>Track:</strong> {req.applicantTrack}<br />
            <strong>Destination:</strong> {req.destination} ({req.reasonCategory})<br />
            <strong>Schedule:</strong> {formatDateTime(req.exitTime)} to {formatDateTime(req.expectedReturnTime)}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>{isApprove ? 'Supervisor Instructions / Clearance Notes:' : 'Reason for Rejection:'}</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder={isApprove ? 'Enter notes or leave blank for default clearance...' : 'Specify why this request cannot be granted...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
          <button
            type="button"
            className={isApprove ? 'btn btn-success' : 'btn btn-danger'}
            onClick={handleSubmit}
          >
            {isApprove ? 'Approve & Issue Gate Pass' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
