import React, { useState } from 'react';
import { Shield, UserCheck, ShieldCheck, UserCog, LogIn, Key, ArrowRight, User } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function LoginPortal({ onSwitchMode }) {
  const { users, loginUser, showToast } = useExeat();
  const [tab, setTab] = useState('student'); // 'student' | 'admin' | 'security'
  
  // Student Form State
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentLoginType, setStudentLoginType] = useState('GatePass');

  // Admin Form State
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginType, setAdminLoginType] = useState('GatePass');

  // Security Form State
  const [secEmailInput, setSecEmailInput] = useState('');
  const [secPassword, setSecPassword] = useState('');

  const students = users.filter(u => u.role === 'participant');
  const admins = users.filter(u => u.role === 'admin' || u.role === 'superadmin');
  const securities = users.filter(u => u.role === 'security');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const query = studentIdInput.trim().toUpperCase();
    if (!query) {
      showToast('Please enter your Student ID or Roll Number', 'error');
      return;
    }
    const match = students.find(s => s.studentId?.toUpperCase() === query || s.email?.toUpperCase() === query);
    
    if (match) {
      if (match.password && match.password !== studentPassword) {
        showToast('Incorrect password', 'error');
      } else {
        loginUser(match, studentLoginType);
      }
    } else {
      // Check if they exist in other roles to provide a better error
      const adminMatch = admins.find(a => a.email?.toUpperCase() === query);
      const securityMatch = securities.find(s => s.email?.toUpperCase() === query);
      
      if (adminMatch) {
        showToast('This account is registered as an Admin. Please use the Admin tab.', 'error');
      } else if (securityMatch) {
        showToast('This account is registered as Security. Please use the Security tab.', 'error');
      } else {
        showToast('Student account not found. Please sign up.', 'error');
      }
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const query = adminEmailInput.trim().toLowerCase();
    const match = admins.find(a => a.email?.toLowerCase() === query);
    
    if (match) {
      if (match.password && match.password !== adminPassword) {
        showToast('Incorrect password', 'error');
      } else {
        loginUser(match, adminLoginType);
      }
    } else {
      // Check if they exist in other roles to provide a better error
      const studentMatch = students.find(s => s.email?.toLowerCase() === query);
      const securityMatch = securities.find(s => s.email?.toLowerCase() === query);
      
      if (studentMatch) {
        showToast('This email is registered as a Student. Please use the Student tab.', 'error');
      } else if (securityMatch) {
        showToast('This email is registered as Security. Please use the Security tab.', 'error');
      } else {
        showToast('Admin account not found. Please sign up.', 'error');
      }
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    const query = secEmailInput.trim().toLowerCase();
    const match = securities.find(s => s.email?.toLowerCase() === query);
    
    if (match) {
      if (match.password && match.password !== secPassword) {
        showToast('Incorrect password', 'error');
      } else {
        loginUser(match);
      }
    } else {
      // Check if they exist in other roles to provide a better error
      const studentMatch = students.find(s => s.email?.toLowerCase() === query);
      const adminMatch = admins.find(a => a.email?.toLowerCase() === query);
      
      if (studentMatch) {
        showToast('This email is registered as a Student. Please use the Student tab.', 'error');
      } else if (adminMatch) {
        showToast('This email is registered as an Admin. Please use the Admin tab.', 'error');
      } else {
        showToast('Security officer not found. Please sign up.', 'error');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          {/* <div className="login-brand-icon">
            <Shield size={32} />
          </div> */}
          <h2>ABIA <span>TECHRISE</span></h2>
          <p>Digital Exit Permission/Gate Control System & Atendance System</p>
        </div>

        {/* Role Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => setTab('student')}
          >
            <UserCheck size={16} /> Student / Participant
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            <ShieldCheck size={16} /> Admin / Supervisor
          </button>
          <button
            className={`login-tab ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            <UserCog size={16} /> Security Officer
          </button>
        </div>

        {/* Student Form */}
        {tab === 'student' && (
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Student ID / Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. tr3/std/jsc/000"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label><Key size={14} style={{ display: 'inline', marginRight: 4 }} /> Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Login Type</label>
              <select
                className="form-control"
                value={studentLoginType}
                onChange={(e) => setStudentLoginType(e.target.value)}
              >
                <option value="GatePass">GatePass</option>
                <option value="Attendance">Attendance</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <LogIn size={16} /> Log In to Student Portal <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Admin Form */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Supervisor Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@camp.org"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label><Key size={14} style={{ display: 'inline', marginRight: 4 }} /> Admin Security Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Login Type</label>
              <select
                className="form-control"
                value={adminLoginType}
                onChange={(e) => setAdminLoginType(e.target.value)}
              >
                <option value="GatePass">GatePass</option>
                <option value="Attendance">Attendance</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <LogIn size={16} /> Log In to Admin Portal <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Security Form */}
        {tab === 'security' && (
          <form onSubmit={handleSecuritySubmit}>
            <div className="form-group">
              <label><UserCog size={14} style={{ display: 'inline', marginRight: 4 }} /> Gate Officer Email / ID</label>
              <input
                type="email"
                className="form-control"
                placeholder="security@camp.org"
                value={secEmailInput}
                onChange={(e) => setSecEmailInput(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label><Key size={14} style={{ display: 'inline', marginRight: 4 }} /> Security Gate Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={secPassword}
                onChange={(e) => setSecPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <LogIn size={16} /> Access Gate Security Terminal <ArrowRight size={16} />
            </button>
          </form>
        )}


        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Don't have an account?</p>
          <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={onSwitchMode}>
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
