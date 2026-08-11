import React, { useState } from 'react';
import { Shield, UserCheck, ShieldCheck, UserCog, UserPlus, ArrowLeft, Key, User, Mail, Hash, Phone, Eye, EyeOff } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function SignUpPortal({ onSwitchMode }) {
  const { registerUser, showToast } = useExeat();
  const [tab, setTab] = useState('student'); // 'student' | 'admin' | 'security'

  // Common State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-Specific State
  const [studentId, setStudentId] = useState('');
  const [track, setTrack] = useState('');
  const [title, setTitle] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password.trim().length < 8) {
      showToast('Password must be 8 characters and above', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (tab === 'student') {
      if (!studentId || !track) {
        showToast('Student ID and Track are required', 'error');
        return;
      }
    }

    const newUser = {
      name,
      email,
      phone,
      password,
      role: tab === 'student' ? 'participant' : tab,
      ...(tab === 'student' && { studentId, track }),
      ...(tab !== 'student' && { title: title || (tab === 'admin' ? 'Administrator' : 'Security Officer') })
    };

    registerUser(newUser);
    showToast('Account created successfully!', 'success');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <div className="login-brand-icon">
            <UserPlus size={32} />
          </div>
          <h2>Create Account</h2>
          {/* <p>Join GatePass Hub to manage exeats</p> */}
        </div>

        {/* Role Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => setTab('student')}
          >
            <UserCheck size={16} /> Student
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            <ShieldCheck size={16} /> Admin
          </button>
          <button
            className={`login-tab ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            <UserCog size={16} /> Security
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {tab === 'student' && (
            <>
              <div className="form-group">
                <label><Hash size={14} style={{ display: 'inline', marginRight: 4 }} /> Student ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. tr3/std/jsc/000"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label><Shield size={14} style={{ display: 'inline', marginRight: 4 }} /> Track / Department</label>
                <select
                  className="form-control"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a track</option>
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
            </>
          )}

          {tab !== 'student' && (
            <div className="form-group">
              <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Job Title</label>
              <input
                type="text"
                className="form-control"
                placeholder={tab === 'admin' ? 'e.g. Camp Director' : 'e.g. Main Gate Officer'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label><Key size={14} style={{ display: 'inline', marginRight: 4 }} /> Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><Key size={14} style={{ display: 'inline', marginRight: 4 }} /> Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            <UserPlus size={16} /> Create {tab.charAt(0).toUpperCase() + tab.slice(1)} Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Already have an account?</p>
          <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={onSwitchMode}>
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
