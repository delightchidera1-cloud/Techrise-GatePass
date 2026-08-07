import React, { useState, useRef } from 'react';
import { useExeat } from '../../context/ExeatContext';
import { Lock, Unlock, CheckCircle, User } from 'lucide-react';
import './Attendance.css';

export default function StudentAttendance() {
  const { currentUser, attendanceSession, attendanceRecords, verifyPIN } = useExeat();
  const [pin, setPin] = useState(['', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  const record = (() => {
    if (!attendanceSession?.openedAt) return null;
    const openedAtStr = attendanceSession.openedAt.endsWith('Z') || attendanceSession.openedAt.includes('+')
      ? attendanceSession.openedAt
      : attendanceSession.openedAt + 'Z';
    const sessionStart = new Date(openedAtStr);
    
    return attendanceRecords.find(r => {
      if (r.studentId !== currentUser?.studentId) return false;
      const recordTimeStr = r.markedAt.endsWith('Z') || r.markedAt.includes('+')
        ? r.markedAt
        : r.markedAt + 'Z';
      return new Date(recordTimeStr) >= sessionStart;
    });
  })();

  const [isLive, setIsLive] = useState(false);

  React.useEffect(() => {
    if (!attendanceSession || attendanceSession.status !== 'OPEN') {
      setIsLive(false);
      return;
    }

    const checkLiveStatus = () => {
      const expiresAtStr = attendanceSession.expiresAt.endsWith('Z') || attendanceSession.expiresAt.includes('+') 
        ? attendanceSession.expiresAt 
        : attendanceSession.expiresAt + 'Z';
      const expires = new Date(expiresAtStr);
      setIsLive(new Date() < expires);
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 1000);
    return () => clearInterval(interval);
  }, [attendanceSession]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value !== '' && index < 2) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length === 3) {
      const success = verifyPIN(fullPin);
      if (success) {
        setPin(['', '', '']);
      }
    }
  };

  return (
    <div className="student-att-wrapper">
      <div className="student-att-header">
        <div className="header-icon">
          <User size={24} color="#fff" />
        </div>
        <h2>Student Check-In Portal</h2>
      </div>

      <div className="student-simulation-bar">
        <label>Logged in as:</label>
        <div className="simulation-input">
          {currentUser?.name} ({currentUser?.studentId})
        </div>
      </div>

      <div className="student-att-card">
        {record && record.status === 'PRESENT' ? (
          <div className="state-content success-state">
            <div className="icon-circle green">
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h3>Attendance Recorded</h3>
            <p>You have been marked present at {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
          </div>
        ) : !isLive ? (
          <div className="state-content closed-state">
            <div className="icon-circle gray">
              <Lock size={32} color="#94a3b8" />
            </div>
            <h3>Attendance Closed</h3>
            <p>Wait for the facilitator to open the session and display the PIN.</p>
            <button className="btn btn-disabled w-100" disabled>Mark Present</button>
          </div>
        ) : (
          <div className="state-content live-state">
            <div className="icon-circle blue">
              <Unlock size={32} color="#3b82f6" />
            </div>
            <h3>Session is Live</h3>
            <p>Enter the 3-digit PIN assigned to you by the facilitator.</p>
            
            <div className="pin-input-group">
              <label>ENTER 3-DIGIT PIN</label>
              <div className="pin-boxes">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>

            <button 
              className={`btn w-100 ${pin.join('').length === 3 ? 'btn-primary' : 'btn-disabled'}`}
              disabled={pin.join('').length !== 3}
              onClick={handleSubmit}
            >
              Submit PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
