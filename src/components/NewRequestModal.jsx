import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function NewRequestModal() {
  const { activeModal, setActiveModal, createRequest, showToast, currentUser, requests } = useExeat();

  const now = new Date();
  const futureExit = new Date(now.getTime() + 1800000).toISOString().slice(0, 16);
  const futureReturn = new Date(now.getTime() + 14400000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    applicantName: '',
    applicantId: '',
    applicantTrack: 'AI AND MACHINE LEARNING',
    applicantPhone: '',
    reasonCategory: 'Project Hardware / Supply Purchase',
    destination: '',
    exitTime: futureExit,
    expectedReturnTime: futureReturn,
    emergencyContact: '',
    detailedReason: ''
  });

  useEffect(() => {
    if (activeModal === 'newRequest' && currentUser) {
      setFormData(prev => ({
        ...prev,
        applicantName: currentUser.name || prev.applicantName,
        applicantId: currentUser.studentId || prev.applicantId,
        applicantTrack: currentUser.track || prev.applicantTrack,
        applicantPhone: currentUser.phone || prev.applicantPhone,
        exitTime: new Date(Date.now() + 1800000).toISOString().slice(0, 16),
        expectedReturnTime: new Date(Date.now() + 14400000).toISOString().slice(0, 16)
      }));
    }
  }, [activeModal, currentUser]);

  if (activeModal !== 'newRequest') return null;

  const isClockedOut = requests?.some(r => r.applicantId === currentUser?.studentId && r.status === 'ACTIVE_OUTSIDE');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isClockedOut) {
      showToast('You cannot apply for a new gate pass while currently clocked out.', 'error');
      return;
    }
    if (formData.expectedReturnTime <= formData.exitTime) {
      showToast('Expected return time must be AFTER departure time!', 'error');
      return;
    }
    createRequest(formData);
    setActiveModal(null);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>New Permission Request</h2>
          <button className="close-btn" onClick={() => setActiveModal(null)}><X size={20} /></button>
        </div>

        {isClockedOut ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '18px' }}>Action Blocked</strong>
              You are currently outside the premises. You cannot submit a new permission request until security has clocked you back in.
            </div>
            <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.applicantName}
                    onChange={(e) => handleChange('applicantName', e.target.value)}
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>
                <div className="form-group">
                  <label>Participant ID / Roll No. *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. TEC-2026-042"
                    value={formData.applicantId}
                    onChange={(e) => handleChange('applicantId', e.target.value)}
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Learning Track / Dept *</label>
                  <select
                    className="form-control"
                    required
                    value={formData.applicantTrack}
                    onChange={(e) => handleChange('applicantTrack', e.target.value)}
                    disabled
                    style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  >
                    <option value="AI AND MACHINE LEARNING">AI AND MACHINE LEARNING</option>
                    <option value="CAD & CAM">CAD & CAM</option>
                    <option value="CYBERSECURITY">CYBERSECURITY</option>
                    <option value="2D ANIMATION">2D ANIMATION</option>
                    <option value="3D ANIMATION">3D ANIMATION</option>
                    <option value="FULLSTACK DEVELOPMENT">FULLSTACK DEVELOPMENT</option>
                    <option value="PYTHON">PYTHON</option>
                    <option value="UI & UX DESIGN">UI & UX DESIGN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    placeholder="e.g. +234 801 234 5678"
                    value={formData.applicantPhone}
                    onChange={(e) => handleChange('applicantPhone', e.target.value)}
                    readOnly
                    style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category of Exit *</label>
                  <select
                    className="form-control"
                    required
                    value={formData.reasonCategory}
                    onChange={(e) => handleChange('reasonCategory', e.target.value)}
                  >
                    <option value="Medical / Health Visit">Medical / Health Visit</option>
                    <option value="Project Hardware / Supply Purchase">Project Hardware / Supply Purchase</option>
                    <option value="Personal / Family Emergency">Personal / Family Emergency</option>
                    <option value="Official Camp Assignment">Official Camp Assignment</option>
                    <option value="Bank / Financial Errand">Bank / Financial Errand</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Specific Destination *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. General Hospital, Ikeja"
                    value={formData.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Proposed Exit Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    required
                    value={formData.exitTime}
                    onChange={(e) => handleChange('exitTime', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Expected Return Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    required
                    value={formData.expectedReturnTime}
                    onChange={(e) => handleChange('expectedReturnTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Emergency Contact (Name & Phone) *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Parent/Guardian: John Morgan (+234 809 111 2222)"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Detailed Explanation / Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide any additional detail for camp supervisors to review..."
                  value={formData.detailedReason}
                  onChange={(e) => handleChange('detailedReason', e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={18} /> Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
