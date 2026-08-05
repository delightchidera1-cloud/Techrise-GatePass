import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IdCard, Printer, Lock } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function DigitalPassModal() {
  const { activeModal, setActiveModal, selectedRequest } = useExeat();

  if (activeModal !== 'digitalPass' || !selectedRequest) return null;

  const req = selectedRequest;

  const qrData = JSON.stringify({
    passId: req.passId,
    token: req.securityToken,
    name: req.applicantName,
    return: req.expectedReturnTime
  });

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card pass-modal-card">
        <div className="modal-header">
          <h3><IdCard size={20} /> Official Digital Gate Pass</h3>
          <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
        </div>
        <div className="modal-body" id="printablePassContent">
          <div className="pass-ticket">
            <div className="pass-header">
              <div className="pass-badge-type" style={{
                background: req.status === 'ACTIVE_OUTSIDE' ? '#06b6d4' : req.status === 'COMPLETED' ? '#6b7280' : '#10b981'
              }}>
                {req.status === 'ACTIVE_OUTSIDE' ? 'ACTIVE OUTSIDE PASS' : req.status === 'COMPLETED' ? 'COMPLETED PASS' : 'APPROVED PASS'}
              </div>
              <h2>TECH EMPOWERMENT CAMP</h2>
              <p>Official Exeat & Gate Clearance Pass</p>
            </div>

            <div className="pass-main-body">
              <div className="qr-container">
                <QRCodeSVG value={qrData} size={140} level="H" includeMargin={true} />
                <span className="qr-pass-id">{req.passId || 'GP-PENDING'}</span>
                <span className="qr-security-token">TOKEN: {req.securityToken || 'N/A'}</span>
              </div>

              <div className="pass-info-grid">
                <div className="info-block">
                  <span className="label">PARTICIPANT NAME</span>
                  <h4>{req.applicantName}</h4>
                </div>
                <div className="info-block">
                  <span className="label">ROLL / ID NO.</span>
                  <p>{req.applicantId}</p>
                </div>
                <div className="info-block">
                  <span className="label">LEARNING TRACK</span>
                  <p>{req.applicantTrack}</p>
                </div>
                <div className="info-block">
                  <span className="label">DESTINATION</span>
                  <p>{req.destination}</p>
                </div>
                <div className="info-block">
                  <span className="label">EXIT SCHEDULE</span>
                  <p>{formatDateTime(req.exitTime)}</p>
                </div>
                <div className="info-block">
                  <span className="label">EXPECTED RETURN</span>
                  <p>{formatDateTime(req.expectedReturnTime)}</p>
                </div>
                <div className="info-block full-width">
                  <span className="label">SUPERVISOR APPROVAL NOTE</span>
                  <p className="approval-note">{req.supervisorNotes || 'Standard pass cleared.'}</p>
                </div>
              </div>
            </div>

            <div className="pass-footer">
              <Lock size={12} style={{ display: 'inline', marginRight: 4 }} /> Gate Verification Code generated dynamically. Present to Gate Officer upon exit and return.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} /> Print Pass
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setActiveModal(null)}>
            Close Pass
          </button>
        </div>
      </div>
    </div>
  );
}
