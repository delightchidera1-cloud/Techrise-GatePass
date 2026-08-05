import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function Toast() {
  const { toasts } = useExeat();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle size={18} />}
          {t.type === 'error' && <AlertCircle size={18} />}
          {t.type === 'info' && <Info size={18} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
