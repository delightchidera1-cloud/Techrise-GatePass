import React, { useState } from 'react';
import { Shield, BookOpen, Settings, Users, Key, Menu, Trash2 } from 'lucide-react';
import AdminPortal from './AdminPortal';
import ClassAssignmentPanel from './ClassAssignmentPanel';
import RecentlyDeletedPanel from './RecentlyDeletedPanel';
import { useExeat } from '../context/ExeatContext';

export default function SuperAdminDashboard() {
  const { activeRole } = useExeat();
  const [activeTab, setActiveTab] = useState('gatepass');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const getTabLabel = () => {
    switch(activeTab) {
      case 'gatepass': return 'Gatepass Hub';
      case 'assignments': return 'Student Assignments';
      case 'facilitators': return 'Facilitator Rights';
      case 'security': return 'Security Accounts';
      case 'deleted': return 'Recently Deleted';
      default: return 'Dashboard';
    }
  };

  if (activeRole !== 'superadmin') {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Access Denied</h3>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard" style={{ position: 'relative' }}>
      <div className="sa-mobile-header">
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{getTabLabel()}</h3>
        <button 
          className="btn btn-outline sa-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className={`sa-tabs-header ${isMenuOpen ? 'open' : ''}`}>
        <button 
          className={`sa-tab-btn ${activeTab === 'gatepass' ? 'active' : ''}`}
          onClick={() => handleTabClick('gatepass')}
        >
          <Shield size={18} /> Gatepass Hub
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => handleTabClick('assignments')}
        >
          <BookOpen size={18} /> Student Assignments
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'facilitators' ? 'active' : ''}`}
          onClick={() => handleTabClick('facilitators')}
        >
          <Settings size={18} /> Facilitator Rights
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => handleTabClick('security')}
        >
          <Key size={18} /> Security Accounts
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'deleted' ? 'active' : ''}`}
          onClick={() => handleTabClick('deleted')}
          style={{ borderLeft: '1px solid var(--border-color)', marginLeft: 'auto', paddingLeft: '1rem' }}
        >
          <Trash2 size={18} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Recently Deleted</span>
        </button>
      </div>

      <div className="sa-tab-content">
        {activeTab === 'gatepass' && <AdminPortal />}
        {activeTab === 'assignments' && <ClassAssignmentPanel activeTab="assignments" />}
        {activeTab === 'facilitators' && <ClassAssignmentPanel activeTab="facilitators" />}
        {activeTab === 'security' && <ClassAssignmentPanel activeTab="security" />}
        {activeTab === 'deleted' && <RecentlyDeletedPanel />}
      </div>
    </div>
  );
}
