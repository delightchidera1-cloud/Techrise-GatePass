import React, { useState, useEffect } from 'react';
import { Shield, UserCog, Clock, Zap, LogOut, User } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function Header() {
  const { currentUser, logoutUser, activeRole, setActiveRole } = useExeat();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(`${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${now.toLocaleTimeString()}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar-content">
          <span className="badge badge-pulse">
            <Zap size={12} style={{ marginRight: 4 }} /> Tech Skill Empowerment Camp v2.4
          </span>
          <span className="top-time">
            <Clock size={14} /> {timeStr}
          </span>
        </div>
      </div>

      <header className="main-header">
        <div className="container header-container">
          <div className="brand">
            <div className="brand-icon">
              <Shield size={24} />
            </div>
            <div className="brand-text">
              <h1>GatePass <span>Hub</span></h1>
              <p>Digital Exeat & Permission Portal</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {currentUser && (
              <div className="user-profile-badge">
                <div className="user-avatar">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role">
                    {currentUser.studentId ? `ID: ${currentUser.studentId}` : currentUser.title || currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
            )}



            {currentUser && (
              <button className="btn btn-outline btn-sm" onClick={logoutUser} title="Log Out">
                <LogOut size={14} /> Log Out
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
