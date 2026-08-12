import React, { useState } from 'react';
import { Shield, BookOpen, Settings, Users, Key } from 'lucide-react';
import AdminPortal from './AdminPortal';
import ClassAssignmentPanel from './ClassAssignmentPanel';
import { useExeat } from '../context/ExeatContext';

export default function SuperAdminDashboard() {
  const { activeRole } = useExeat();
  const [activeTab, setActiveTab] = useState('gatepass');

  if (activeRole !== 'superadmin') {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Access Denied</h3>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <div className="sa-tabs-header">
        <button 
          className={`sa-tab-btn ${activeTab === 'gatepass' ? 'active' : ''}`}
          onClick={() => setActiveTab('gatepass')}
        >
          <Shield size={18} /> Gatepass Hub
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <BookOpen size={18} /> Student Assignments
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'facilitators' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilitators')}
        >
          <Settings size={18} /> Facilitator Rights
        </button>
        <button 
          className={`sa-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={18} /> Security Accounts
        </button>
      </div>

      <div className="sa-tab-content">
        {activeTab === 'gatepass' && <AdminPortal />}
        {activeTab === 'assignments' && <ClassAssignmentPanel activeTab="assignments" />}
        {activeTab === 'facilitators' && <ClassAssignmentPanel activeTab="facilitators" />}
        {activeTab === 'security' && <ClassAssignmentPanel activeTab="security" />}
      </div>
    </div>
  );
}
