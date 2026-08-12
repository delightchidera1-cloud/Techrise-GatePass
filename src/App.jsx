import React from 'react';
import { ExeatProvider, useExeat } from './context/ExeatContext';
import Header from './components/Header';
import RoleBanner from './components/RoleBanner';
import StatsGrid from './components/StatsGrid';
import ParticipantPortal from './components/ParticipantPortal';
import AdminPortal from './components/AdminPortal';
import SecurityPortal from './components/SecurityPortal';
import NewRequestModal from './components/NewRequestModal';
import DigitalPassModal from './components/DigitalPassModal';
import AdminActionModal from './components/AdminActionModal';
import Toast from './components/Toast';
import LoginPortal from './components/LoginPortal';
import SignUpPortal from './components/SignUpPortal';
import StudentProfileModal from './components/StudentProfileModal';
import ClassAssignmentPanel from './components/ClassAssignmentPanel';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import FacilitatorAttendance from './components/attendance/FacilitatorAttendance';
import StudentAttendance from './components/attendance/StudentAttendance';

function MainContent() {
  const { currentUser, activeRole, currentLoginType } = useExeat();
  const [authMode, setAuthMode] = React.useState('login');

  if (!currentUser) {
    return authMode === 'login' 
      ? <LoginPortal onSwitchMode={() => setAuthMode('signup')} /> 
      : <SignUpPortal onSwitchMode={() => setAuthMode('login')} />;
  }

  if (currentLoginType === 'Attendance') {
    return (
      <main className="container" style={{ paddingBottom: '3rem' }}>
        {activeRole === 'participant' ? <StudentAttendance /> : <FacilitatorAttendance />}
        <Toast />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingBottom: '3rem' }}>
      <RoleBanner />
      <StatsGrid />

      {activeRole === 'participant' && <ParticipantPortal />}
      {activeRole === 'admin' && <AdminPortal />}
      {activeRole === 'superadmin' && <SuperAdminDashboard />}
      {activeRole === 'security' && <SecurityPortal />}

      <NewRequestModal />
      <DigitalPassModal />
      <AdminActionModal />
      <StudentProfileModal />
      <Toast />
    </main>
  );
}

export default function App() {
  return (
    <ExeatProvider>
      <AppBody />
    </ExeatProvider>
  );
}

function AppBody() {
  const { currentUser } = useExeat();

  return (
    <>
      {currentUser && <Header />}
      <MainContent />
      {!currentUser && <Toast />}
    </>
  );
}
