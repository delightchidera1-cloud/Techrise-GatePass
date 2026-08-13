import React, { useState, useEffect } from 'react';
import { useExeat } from '../../context/ExeatContext';
import { Clock, Play, Square, CheckCircle, XCircle, MinusCircle, User, SlidersHorizontal, PlayCircle, ChevronRight, GraduationCap, Calendar, X } from 'lucide-react';
import './Attendance.css';

export default function FacilitatorAttendance() {
  const {
    users,
    currentUser,
    attendanceSession,
    sessionPINs,
    attendanceRecords,
    studentPerformances,
    openAttendanceSession,
    closeAttendanceSession,
    refreshAttendanceData
  } = useExeat();

  const [timeLeft, setTimeLeft] = useState('00:00');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fallback polling mechanism: in case Supabase Realtime is disabled or delayed
  useEffect(() => {
    if (attendanceSession?.status !== 'OPEN' || !refreshAttendanceData) return;
    
    const pollInterval = setInterval(() => {
      refreshAttendanceData();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [attendanceSession?.status, refreshAttendanceData]);

  const participants = users.filter(u => u.role === 'participant' && u.assignedTutorId === currentUser?.id);
  const enrolledCount = participants.length;
  const presentCount = (() => {
    if (!attendanceSession?.openedAt) return 0;
    const openedAtStr = attendanceSession.openedAt.replace(' ', 'T').endsWith('Z') || attendanceSession.openedAt.replace(' ', 'T').includes('+')
      ? attendanceSession.openedAt.replace(' ', 'T')
      : attendanceSession.openedAt.replace(' ', 'T') + 'Z';
    const sessionStart = new Date(new Date(openedAtStr).getTime() - 300000); // 5 min buffer
    
    return attendanceRecords.filter(r => {
      const recordTimeStr = r.markedAt.replace(' ', 'T').endsWith('Z') || r.markedAt.replace(' ', 'T').includes('+')
        ? r.markedAt.replace(' ', 'T')
        : r.markedAt.replace(' ', 'T') + 'Z';
      return r.status === 'PRESENT' && new Date(recordTimeStr) >= sessionStart;
    }).length;
  })();

  useEffect(() => {
    if (!attendanceSession || attendanceSession.status !== 'OPEN') {
      setTimeLeft('00:00');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      // Ensure expiresAt is treated as UTC if it doesn't already have a timezone indicator
      const expiresAtStr = attendanceSession.expiresAt.replace(' ', 'T').endsWith('Z') || attendanceSession.expiresAt.replace(' ', 'T').includes('+') 
        ? attendanceSession.expiresAt.replace(' ', 'T') 
        : attendanceSession.expiresAt.replace(' ', 'T') + 'Z';
      const expires = new Date(expiresAtStr);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        closeAttendanceSession();
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attendanceSession, closeAttendanceSession]);

  const getStudentStatus = (studentId) => {
    let relevantRecords = attendanceRecords;
    
    // Only consider records created during or after the current session
    if (attendanceSession?.openedAt) {
      const openedAtStr = attendanceSession.openedAt.replace(' ', 'T').endsWith('Z') || attendanceSession.openedAt.replace(' ', 'T').includes('+')
        ? attendanceSession.openedAt.replace(' ', 'T')
        : attendanceSession.openedAt.replace(' ', 'T') + 'Z';
      const sessionStart = new Date(new Date(openedAtStr).getTime() - 300000); // 5 min buffer
      
      relevantRecords = attendanceRecords.filter(r => {
        const recordTimeStr = r.markedAt.replace(' ', 'T').endsWith('Z') || r.markedAt.replace(' ', 'T').includes('+')
          ? r.markedAt.replace(' ', 'T')
          : r.markedAt.replace(' ', 'T') + 'Z';
        return new Date(recordTimeStr) >= sessionStart;
      });
    }

    const record = relevantRecords.find(r => r.studentId === studentId);
    if (record) {
      return record;
    }
    return { status: 'PENDING' };
  };

  const getStudentPIN = (studentId) => {
    const p = sessionPINs.find(p => p.studentId === studentId);
    return p ? p.pin : '---';
  };

  return (
    <div className="attendance-layout">
      <div className="attendance-sidebar">
        <div className="sidebar-header">
          <h2>CS-101 Attendance</h2>
          <p>Intro to Computer Science</p>
        </div>

        <div className="session-title">
          <SlidersHorizontal size={14} color="#64748b" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          <h4>SESSION CONTROLS</h4>
        </div>

        <div className="session-controls-box">
          <div className="control-header">
            <span className="status-label">Status</span>
            <span className={`status-badge ${attendanceSession?.status === 'OPEN' ? 'live' : 'closed'}`}>
              {attendanceSession?.status === 'OPEN' ? 'LIVE' : 'CLOSED'}
            </span>
          </div>

          {attendanceSession?.status === 'OPEN' ? (
            <>
              <div className="timer-box">
                <Clock size={16} /> Time Remaining <span>{timeLeft}</span>
              </div>
              <button className="btn btn-danger w-100" onClick={closeAttendanceSession}>
                <Square size={16} style={{ marginRight: '8px' }} /> Close Attendance
              </button>
            </>
          ) : (
            <button className="btn btn-purple w-100" onClick={openAttendanceSession}>
              <PlayCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Open Attendance
            </button>
          )}
        </div>

        <div className="metrics-row">
          <div className="metric-box-outline">
            <h3 className="text-purple">{presentCount}</h3>
            <p>PRESENT</p>
          </div>
          <div className="metric-box-outline">
            <h3>{enrolledCount}</h3>
            <p>ENROLLED</p>
          </div>
        </div>
      </div>

      <div className="attendance-main">
        <div className="main-top-section" style={{ backgroundColor: '#ffffff' }}>
          <div className="main-heade">
            <h2>Today's Roster</h2>
            <p>Click on any student to view their detailed performance and missed days.</p>
          </div>
        </div>
        <div className="main-bottom-section">
          <div className="roster-table-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Auth PIN</th>
                  <th>Check-in Time</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(student => {
                  const stat = getStudentStatus(student.studentId);
                  const pin = getStudentPIN(student.studentId);
                  const isLive = attendanceSession?.status === 'OPEN';

                  let rowClass = '';
                  let statusIcon = <div className="status-icon-pending"><MinusCircle size={14} color="#94a3b8" /></div>;
                  let displayPin = pin;
                  let displayTime = '--:--';

                  if (stat.status === 'PRESENT') {
                    rowClass = 'row-present';
                    statusIcon = <CheckCircle size={18} color="#10b981" />;
                    displayPin = 'USED';
                    displayTime = new Date(stat.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } else if (stat.status === 'ABSENT') {
                    rowClass = 'row-absent';
                    statusIcon = <XCircle size={18} color="#ef4444" />;
                    displayPin = 'EXPIRED';
                  } else {
                    displayPin = isLive ? <span className="pin-badge">{pin}</span> : '---';
                  }

                  return (
                    <tr key={student.studentId} className={rowClass} onClick={() => setSelectedStudent(student)} style={{ cursor: 'pointer' }}>
                      <td className="status-cell">{statusIcon}</td>
                      <td className="name-cell">
                        <div className="avatar-purple">{student.name.substring(0, 2).toUpperCase()}</div>
                        <strong>{student.name}</strong>
                      </td>
                      <td className="id-cell">{student.studentId}</td>
                      <td className="pin-cell">{displayPin}</td>
                      <td className="time-cell">{displayTime}</td>
                      <td className="profile-cell">
                        <div className="hover-icon" style={{ transition: 'opacity 0.2s', display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Drawer Overlay */}
      {selectedStudent && (
        <div className="attendance-overlay" onClick={() => setSelectedStudent(null)} />
      )}

      {/* Slide-out Drawer */}
      <AttendanceProfilePanel 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        attendanceRecords={attendanceRecords}
        studentPerformances={studentPerformances}
      />
    </div>
  );
}

function AttendanceProfilePanel({ student, onClose, attendanceRecords, studentPerformances }) {
  if (!student) {
    return <div className="attendance-drawer"></div>; // Render empty drawer for transition out
  }

  // Calculate stats all-time
  const studentRecords = attendanceRecords.filter(r => r.studentId === student.studentId);
  const daysPresent = studentRecords.filter(r => r.status === 'PRESENT').length;
  const daysAbsent = studentRecords.filter(r => r.status === 'ABSENT').length;
  const totalDays = daysPresent + daysAbsent;
  const overallPercent = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0;
  
  const missedClasses = studentRecords
    .filter(r => r.status === 'ABSENT')
    .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt));

  // Get Performance data
  const perf = studentPerformances.find(p => p.studentId === student.studentId) || {
    currentGrade: 'N/A',
    participationScore: 0
  };

  const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`attendance-drawer ${student ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-profile-info">
          <div className="drawer-avatar">{initials}</div>
          <div>
            <h2 className="drawer-name">{student.name}</h2>
            <p className="drawer-id">ID: {student.studentId}</p>
          </div>
        </div>
        <button className="close-drawer-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="drawer-content">
        
        {/* Attendance Analytics */}
        <div>
          <h4 className="section-title">ATTENDANCE ANALYTICS</h4>
          <div className="analytics-box">
            <div className="overall-row">
              <span className="overall-label">Overall Attendance</span>
              <span className="overall-percent" style={{ color: overallPercent >= 80 ? '#4f46e5' : '#ef4444' }}>{overallPercent}%</span>
            </div>
            
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${overallPercent}%`,
                  backgroundColor: overallPercent >= 80 ? '#10b981' : '#ef4444'
                }} 
              />
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card present">
                <h3>{daysPresent}</h3>
                <p>DAYS PRESENT</p>
              </div>
              <div className="metric-card absent">
                <h3>{daysAbsent}</h3>
                <p>DAYS ABSENT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h4 className="section-title">PERFORMANCE</h4>
          <div className="performance-grid">
            <div className="perf-card grade">
              <div className="perf-label">CURRENT GRADE</div>
              <div className="perf-value">{perf.currentGrade}</div>
            </div>
            <div className="perf-card participation">
              <div className="perf-label">PARTICIPATION</div>
              <div className="perf-value">{perf.participationScore}%</div>
            </div>
          </div>
        </div>

        {/* Missed Classes Log */}
        {missedClasses.length > 0 && (
          <div>
            <h4 className="section-title">MISSED CLASSES LOG</h4>
            <div className="missed-log-list">
              {missedClasses.map((m, idx) => (
                <div key={idx} className="missed-card">
                  <Calendar size={18} color="#ef4444" />
                  <span>{new Date(m.markedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
