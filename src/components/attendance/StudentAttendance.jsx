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
    const openedAtStr = attendanceSession.openedAt.replace(' ', 'T').endsWith('Z') || attendanceSession.openedAt.replace(' ', 'T').includes('+')
      ? attendanceSession.openedAt.replace(' ', 'T')
      : attendanceSession.openedAt.replace(' ', 'T') + 'Z';
    const sessionStart = new Date(new Date(openedAtStr).getTime() - 300000); // 5 min buffer
    
    return attendanceRecords.find(r => {
      if (r.studentId !== currentUser?.studentId) return false;
      const recordTimeStr = r.markedAt.replace(' ', 'T').endsWith('Z') || r.markedAt.replace(' ', 'T').includes('+')
        ? r.markedAt.replace(' ', 'T')
        : r.markedAt.replace(' ', 'T') + 'Z';
      return new Date(recordTimeStr) >= sessionStart;
    });
  })();

  const [isLive, setIsLive] = useState(false);

  React.useEffect(() => {
    if (!attendanceSession || attendanceSession.status !== 'OPEN') {
      setIsLive(false);
      return;
    }

    // A session is strictly live if its status is OPEN.
    // The Facilitator's device handles the countdown and closes it,
    // which prevents the student's portal from accidentally closing early due to client clock drift.
    setIsLive(true);
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

  const handleSubmit = async () => {
    const fullPin = pin.join('');
    if (fullPin.length === 3) {
      const success = await verifyPIN(fullPin);
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
