import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const ExeatContext = createContext();

export function ExeatProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Keep current session in localStorage to persist login across reloads
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('GATEPASS_HUB_USER_V1');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeRole, setActiveRole] = useState(currentUser?.role || 'participant');
  const [currentLoginType, setCurrentLoginType] = useState(localStorage.getItem('GATEPASS_HUB_LOGIN_TYPE') || 'GatePass');

  const [attendanceSession, setAttendanceSession] = useState(null);
  const [sessionPINs, setSessionPINs] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentPerformances, setStudentPerformances] = useState([]);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load Initial Data from Supabase
  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchAttendanceData();
    fetchStudentPerformances();

    // Set up Realtime subscriptions
    const usersSub = supabase.channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();

    const reqSub = supabase.channel('public:gatepass_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gatepass_requests' }, fetchRequests)
      .subscribe();

    const attSessionSub = supabase.channel('public:attendance_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, fetchAttendanceData)
      .subscribe();

    const attPinsSub = supabase.channel('public:attendance_pins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_pins' }, fetchAttendanceData)
      .subscribe();

    const attRecordsSub = supabase.channel('public:attendance_records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, fetchAttendanceData)
      .subscribe();

    const perfSub = supabase.channel('public:student_performance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_performance' }, fetchStudentPerformances)
      .subscribe();

    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(reqSub);
      supabase.removeChannel(attSessionSub);
      supabase.removeChannel(attPinsSub);
      supabase.removeChannel(attRecordsSub);
      supabase.removeChannel(perfSub);
    };
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('fetchUsers error:', error);
    if (data) setUsers(data);
  }

  async function fetchStudentPerformances() {
    const { data } = await supabase.from('student_performance').select('*');
    if (data) setStudentPerformances(data);
  }

  async function fetchRequests() {
    const { data } = await supabase.from('gatepass_requests').select('*').order('createdAt', { ascending: false });
    if (data) setRequests(data);
  }

  async function fetchAttendanceData() {
    const { data: sessionData } = await supabase.from('attendance_sessions').select('*').order('openedAt', { ascending: false }).limit(1);
    if (sessionData && sessionData.length > 0) {
      setAttendanceSession(sessionData[0]);
      
      const { data: pinsData } = await supabase.from('attendance_pins').select('*');
      if (pinsData) setSessionPINs(pinsData);
      
      const { data: recordsData } = await supabase.from('attendance_records').select('*');
      if (recordsData) setAttendanceRecords(recordsData);
    } else {
      setAttendanceSession(null);
      setSessionPINs([]);
      setAttendanceRecords([]);
    }
  }

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loginUser = (userObj, loginType = 'GatePass') => {
    setCurrentUser(userObj);
    setActiveRole(userObj.role);
    setCurrentLoginType(loginType);
    localStorage.setItem('GATEPASS_HUB_USER_V1', JSON.stringify(userObj));
    localStorage.setItem('GATEPASS_HUB_LOGIN_TYPE', loginType);
    showToast(`Welcome back, ${userObj.name}!`, 'success');
  };

  const registerUser = async (newUserObj) => {
    const { data, error } = await supabase.from('users').insert([newUserObj]).select();
    if (error) {
      showToast('Registration failed: ' + error.message, 'error');
    } else if (data) {
      loginUser(data[0]);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActiveModal(null);
    localStorage.removeItem('GATEPASS_HUB_USER_V1');
    localStorage.removeItem('GATEPASS_HUB_LOGIN_TYPE');
    showToast('Logged out successfully.', 'info');
  };

  const createRequest = async (newReq) => {
    const req = {
      ...newReq,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from('gatepass_requests').insert([req]);
    if (error) showToast('Failed to submit application.', 'error');
    else showToast('Permission application submitted! Awaiting supervisor review.', 'success');
  };

  const approveRequest = async (id, notes) => {
    const adminName = currentUser?.name || 'Camp Admin';
    const passId = 'GP-' + Math.floor(1000 + Math.random() * 9000);
    const securityToken = 'SEC-' + Math.floor(1000 + Math.random() * 9000) + '-X';
    
    const { error } = await supabase.from('gatepass_requests').update({
      status: 'APPROVED',
      passId: passId,
      securityToken: securityToken,
      supervisorNotes: notes || 'Approved by Camp Supervisor.',
      approvedBy: adminName
    }).eq('id', id);

    if (error) showToast('Failed to approve request.', 'error');
    else showToast('Pass approved and digital QR ticket issued!', 'success');
  };

  const rejectRequest = async (id, reason) => {
    const adminName = currentUser?.name || 'Camp Admin';
    const { error } = await supabase.from('gatepass_requests').update({
      status: 'REJECTED',
      supervisorNotes: reason || 'Application declined by supervisor.',
      approvedBy: adminName
    }).eq('id', id);

    if (error) showToast('Failed to decline request.', 'error');
    else showToast('Application declined.', 'info');
  };

  const clockOutParticipant = async (id) => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const { error } = await supabase.from('gatepass_requests').update({
      status: 'ACTIVE_OUTSIDE',
      actualExitTime: nowStr
    }).eq('id', id);

    if (!error) showToast('Participant marked DEPARTED.', 'success');
  };

  const clockInParticipant = async (id) => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const { error } = await supabase.from('gatepass_requests').update({
      status: 'COMPLETED',
      actualReturnTime: nowStr
    }).eq('id', id);

    if (!error) showToast('Participant marked RETURNED. Pass completed.', 'success');
  };

  const openAttendanceSession = async () => {
    const sessionId = 'ATT-' + Date.now();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    const { error: sessionError } = await supabase.from('attendance_sessions').insert([{
      id: sessionId,
      status: 'OPEN',
      expiresAt: expiresAt
    }]);

    if (!sessionError) {
      // Delete old pins to prevent finding old pins
      await supabase.from('attendance_pins').delete().neq('studentId', 'dummy');
      
      const participants = users.filter(u => u.role === 'participant' && u.studentId);
      const newPINs = participants.map(p => ({
        studentId: p.studentId,
        pin: Math.floor(100 + Math.random() * 900).toString(),
        used: false
      }));
      if(newPINs.length > 0) {
        const { error: pinError } = await supabase.from('attendance_pins').insert(newPINs);
        if (pinError) console.error("Error inserting pins:", pinError);
      }
      showToast('Attendance Session Opened', 'success');
      fetchAttendanceData();
    }
  };

  const closeAttendanceSession = async () => {
    if (!attendanceSession) return;
    
    await supabase.from('attendance_sessions').update({ status: 'CLOSED' }).eq('id', attendanceSession.id);
    
    // Mark absent
    const participants = users.filter(u => u.role === 'participant');
    const recordsToInsert = [];
    
    // Only check records from this session
    const openedAtStr = attendanceSession.openedAt.endsWith('Z') || attendanceSession.openedAt.includes('+')
      ? attendanceSession.openedAt
      : attendanceSession.openedAt + 'Z';
    const sessionStart = new Date(openedAtStr);

    participants.forEach(p => {
      const hasRecordThisSession = attendanceRecords.find(r => {
        if (r.studentId !== p.studentId) return false;
        const recordTimeStr = r.markedAt.endsWith('Z') || r.markedAt.includes('+')
          ? r.markedAt
          : r.markedAt + 'Z';
        return new Date(recordTimeStr) >= sessionStart;
      });

      if (!hasRecordThisSession) {
        recordsToInsert.push({
          studentId: p.studentId,
          status: 'ABSENT',
          markedAt: new Date().toISOString()
        });
      }
    });

    if (recordsToInsert.length > 0) {
      await supabase.from('attendance_records').insert(recordsToInsert);
    }
    showToast('Attendance Session Closed', 'info');
  };

  const verifyPIN = async (pin) => {
    if (!attendanceSession || attendanceSession.status !== 'OPEN') {
      showToast('No active session.', 'error');
      return false;
    }

    const isClockedOut = requests.some(r => r.applicantId === currentUser?.studentId && r.status === 'ACTIVE_OUTSIDE');
    if (isClockedOut) {
      showToast('Cannot mark attendance while clocked out by security.', 'error');
      return false;
    }

    const record = sessionPINs.find(p => p.studentId === currentUser?.studentId);
    if (!record || record.pin !== pin) {
      showToast('Invalid PIN', 'error');
      return false;
    }
    
    const openedAtStr = attendanceSession.openedAt.endsWith('Z') || attendanceSession.openedAt.includes('+')
      ? attendanceSession.openedAt
      : attendanceSession.openedAt + 'Z';
    const sessionStart = new Date(openedAtStr);
    
    const alreadyVerified = attendanceRecords.find(r => {
      if (r.studentId !== currentUser.studentId) return false;
      const recordTimeStr = r.markedAt.endsWith('Z') || r.markedAt.includes('+')
        ? r.markedAt
        : r.markedAt + 'Z';
      return new Date(recordTimeStr) >= sessionStart;
    });

    if (alreadyVerified) {
      return true; // Already verified
    }

    await supabase.from('attendance_pins').update({ used: true }).eq('id', record.id);
    await supabase.from('attendance_records').insert([{
      studentId: currentUser.studentId,
      status: 'PRESENT',
      markedAt: new Date().toISOString()
    }]);
    
    showToast('Attendance Recorded', 'success');
    return true;
  };

  const assignClassBatch = async (studentIds, className, tutorId) => {
    // update multiple students in the users table
    const { error } = await supabase
      .from('users')
      .update({ assignedClass: className, assignedTutorId: tutorId })
      .in('id', studentIds);

    if (error) {
      showToast('Failed to assign class batch.', 'error');
      return false;
    } else {
      showToast(`Successfully assigned ${studentIds.length} students to ${className}.`, 'success');
      return true;
    }
  };

  const assignIndividualStudent = async (studentId, className, tutorId) => {
    const { error } = await supabase
      .from('users')
      .update({ assignedClass: className, assignedTutorId: tutorId || null })
      .eq('id', studentId);

    if (error) {
      showToast('Failed to assign student.', 'error');
      return false;
    } else {
      showToast(`Student assigned to ${className}`, 'success');
      return true;
    }
  };

  const assignClassFacilitator = async (className, tutorId) => {
    const { error } = await supabase
      .from('users')
      .update({ assignedTutorId: tutorId || null })
      .eq('assignedClass', className);
      
    if (error) {
      showToast(`Failed to update facilitator for ${className}`, 'error');
      return false;
    } else {
      showToast(`Facilitator updated for ${className}`, 'success');
      return true;
    }
  };

  const exportToCSV = () => {
    const headers = ['Pass ID', 'Applicant Name', 'Participant ID', 'Track', 'Reason', 'Destination', 'Exit Time', 'Expected Return', 'Status'];
    const rows = requests.map(r => [
      r.passId || 'N/A',
      `"${r.applicantName}"`,
      r.applicantId,
      `"${r.applicantTrack}"`,
      `"${r.reasonCategory}"`,
      `"${r.destination}"`,
      r.exitTime,
      r.expectedReturnTime,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Exeat_Logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    showToast('CSV exeat log downloaded!', 'success');
  };

  // Evaluate Overdue Items Locally
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = new Date().toISOString().slice(0, 16);
      setRequests(prev => prev.map(req => {
        if (req.status === 'ACTIVE_OUTSIDE' && req.expectedReturnTime && req.expectedReturnTime < nowStr) {
          return { ...req, isOverdue: true };
        }
        return { ...req, isOverdue: false };
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ExeatContext.Provider value={{
      requests,
      currentUser,
      users,
      loginUser,
      logoutUser,
      registerUser,
      activeRole,
      setActiveRole,
      activeModal,
      setActiveModal,
      selectedRequest,
      setSelectedRequest,
      toasts,
      showToast,
      createRequest,
      approveRequest,
      rejectRequest,
      clockOutParticipant,
      clockInParticipant,
      exportToCSV,
      currentLoginType,
      attendanceSession,
      sessionPINs,
      attendanceRecords,
      studentPerformances,
      openAttendanceSession,
      closeAttendanceSession,
      verifyPIN,
      assignClassBatch,
      assignIndividualStudent,
      assignClassFacilitator
    }}>
      {children}
    </ExeatContext.Provider>
  );
}

export function useExeat() {
  return useContext(ExeatContext);
}
