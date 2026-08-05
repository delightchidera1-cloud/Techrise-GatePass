import React from 'react';
import { UserCheck, ShieldCheck, UserCog, Plus } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function RoleBanner() {
  const { activeRole, setActiveModal } = useExeat();

  const getBannerDetails = () => {
    switch (activeRole) {
      case 'superadmin':
        return {
          title: 'System Superadmin Portal',
          desc: 'Manage class assignments, view all camp statistics, and oversee the entire system.',
          icon: <ShieldCheck size={28} />
        };
      case 'admin':
        return {
          title: 'Camp Supervisor & Admin Portal',
          desc: 'Review pending exeat applications, grant digital gate passes, and monitor overall camp attendance.',
          icon: <ShieldCheck size={28} />
        };
      case 'security':
        return {
          title: 'Gate Security Officer Portal',
          desc: 'Scan QR code or enter Pass ID to log participant departure (Clock Out) and arrival (Clock In).',
          icon: <UserCog size={28} />
        };
      default:
        return {
          title: 'Participant Workspace',
          desc: 'Submit new permission requests, track live approval status, and present your digital QR gate pass.',
          icon: <UserCheck size={28} />
        };
    }
  };

  const details = getBannerDetails();

  return (
    <div className="role-banner">
      <div className="role-banner-info">
        <div className="icon-wrap">
          {details.icon}
        </div>
        <div>
          <h2>{details.title}</h2>
          <p>{details.desc}</p>
        </div>
      </div>
      <div className="role-banner-actions">
        {activeRole === 'participant' && (
          <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('newRequest')}>
            <Plus size={14} /> New Permission Request
          </button>
        )}
      </div>
    </div>
  );
}
