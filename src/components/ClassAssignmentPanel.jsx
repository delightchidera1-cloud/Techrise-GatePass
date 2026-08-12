import React, { useState, useMemo } from 'react';
import { Users, BookOpen, Save, Settings, ShieldAlert, Trash2 } from 'lucide-react';
import { useExeat } from '../context/ExeatContext';

export default function ClassAssignmentPanel({ activeTab = 'all' }) {
  const { users, assignIndividualStudent, assignClassFacilitator, activeRole, toggleFacilitatorGlobalApproval, toggleSecurityActivation, transferStudentTrack, softDeleteUser } = useExeat();
  const [selectedTrack, setSelectedTrack] = useState('');
  
  const [savingGlobalApprovalId, setSavingGlobalApprovalId] = useState(null);
  const [savingSecurityId, setSavingSecurityId] = useState(null);
  const [processingDeleteId, setProcessingDeleteId] = useState(null);

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? They will be moved to Recently Deleted.`)) {
      setProcessingDeleteId(user.id);
      await softDeleteUser(user.id);
      setProcessingDeleteId(null);
    }
  };
  
  const handleToggleGlobalApproval = async (tutor) => {
    setSavingGlobalApprovalId(tutor.id);
    await toggleFacilitatorGlobalApproval(tutor.id, tutor.canApproveAll);
    setSavingGlobalApprovalId(null);
  };

  const handleToggleSecurityActivation = async (sec) => {
    setSavingSecurityId(sec.id);
    await toggleSecurityActivation(sec.id, sec.isActivated);
    setSavingSecurityId(null);
  };
  
  // Local state for dropdowns by student id
  const [studentAssignments, setStudentAssignments] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Class-level facilitators
  const [classFacilitators, setClassFacilitators] = useState({ A: '', B: '', C: '' });
  const [savingClassFacilitator, setSavingClassFacilitator] = useState(null);

  // We only want superadmin to use this
  if (activeRole !== 'superadmin') {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Access Denied</h3>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  const tracks = useMemo(() => {
    const allTracks = users.filter(u => u.role === 'participant' && u.track).map(u => u.track);
    return [...new Set(allTracks)].sort();
  }, [users]);

  const tutors = useMemo(() => {
    return users.filter(u => u.role === 'admin');
  }, [users]);

  const securityOfficers = useMemo(() => {
    return users.filter(u => u.role === 'security');
  }, [users]);

  // All students in selected track
  const allStudentsInTrack = useMemo(() => {
    if (!selectedTrack) return [];
    return users
      .filter(u => u.role === 'participant' && u.track === selectedTrack)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedTrack, users]);

  // Initialize local state when track changes or users update
  React.useEffect(() => {
    if (allStudentsInTrack.length > 0) {
      const initialAssigments = {};
      const initialFacilitators = { A: '', B: '', C: '' };

      allStudentsInTrack.forEach(s => {
        let currentClassLetter = '';
        if (s.assignedClass) {
          const match = s.assignedClass.match(/CLASS\s+([A-C])$/i);
          if (match) {
            currentClassLetter = match[1];
            // Infer class facilitator if not already set
            if (!initialFacilitators[currentClassLetter] && s.assignedTutorId) {
              initialFacilitators[currentClassLetter] = s.assignedTutorId;
            }
          }
        }
        initialAssigments[s.id] = { classLetter: currentClassLetter, track: s.track || '' };
      });
      
      setStudentAssignments(initialAssigments);
      
      // Update facilitators only if they are empty in state (prevents overriding user mid-edit)
      setClassFacilitators(prev => ({
        A: initialFacilitators.A || prev.A,
        B: initialFacilitators.B || prev.B,
        C: initialFacilitators.C || prev.C,
      }));
    }
  }, [allStudentsInTrack, users]);

  const handleAssignmentChange = (studentId, field, value) => {
    setStudentAssignments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveStudent = async (student) => {
    const assignment = studentAssignments[student.id];
    if (!assignment) return;
    
    setSavingId(student.id);
    
    // Transfer track if it changed
    if (assignment.track !== student.track) {
      await transferStudentTrack(student.id, assignment.track);
    } else {
      // Just normal class assignment
      const className = `${selectedTrack.toUpperCase()} CLASS ${assignment.classLetter}`;
      const mappedTutorId = classFacilitators[assignment.classLetter] || null;
      await assignIndividualStudent(student.id, className, mappedTutorId);
    }
    setSavingId(null);
  };

  const handleSaveClassFacilitator = async (classLetter) => {
    setSavingClassFacilitator(classLetter);
    const className = `${selectedTrack.toUpperCase()} CLASS ${classLetter}`;
    const tutorId = classFacilitators[classLetter] || null;
    await assignClassFacilitator(className, tutorId);
    setSavingClassFacilitator(null);
  };

  // Check if a tutor is already assigned to another class globally
  const isTutorAssignedElsewhere = (tutorId, currentClassLetter) => {
    // 1. Check local unsaved state for the current track
    const otherLocalClasses = ['A', 'B', 'C'].filter(c => c !== currentClassLetter);
    if (otherLocalClasses.some(c => classFacilitators[c] === tutorId)) {
      return true;
    }

    // 2. Check global state across all tracks
    const currentClassName = `${selectedTrack.toUpperCase()} CLASS ${currentClassLetter}`;
    return users.some(u => 
      u.role === 'participant' && 
      u.assignedTutorId === tutorId && 
      u.assignedClass && 
      u.assignedClass !== currentClassName
    );
  };

  return (
    <div className="card panel-header-card" style={{ marginTop: '2rem' }}>
      {(activeTab === 'all' || activeTab === 'assignments') && (
        <div className="panel-header" style={{ marginBottom: '0' }}>
          <div>
            <h3><BookOpen size={20} /> Class & Facilitator Assignments</h3>
            <p className="panel-subtitle">Assign students to classes and assign facilitators to those classes.</p>
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'assignments') && (
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Select Course / Track</label>
          <select 
            className="form-control" 
            value={selectedTrack} 
            onChange={(e) => setSelectedTrack(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            <option value="">-- Choose a Course --</option>
            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {selectedTrack && (activeTab === 'all' || activeTab === 'assignments') && (
        <div style={{ padding: '1.5rem' }}>
          
          {/* Global Class Configuration */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Settings size={18} /> Class Facilitator Configuration
            </h4>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Assign one facilitator per class. A facilitator cannot be assigned to multiple classes simultaneously. 
              Saving will update all students currently in that class.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {['A', 'B', 'C'].map(letter => (
                <div key={letter} style={{ flex: '1 1 200px', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Class {letter} Facilitator</label>
                  <select
                    className="form-control"
                    value={classFacilitators[letter]}
                    onChange={(e) => setClassFacilitators(prev => ({ ...prev, [letter]: e.target.value }))}
                    style={{ marginBottom: '1rem' }}
                  >
                    <option value="">-- No Facilitator --</option>
                    {tutors.map(t => (
                      <option 
                        key={t.id} 
                        value={t.id}
                        disabled={isTutorAssignedElsewhere(t.id, letter)}
                      >
                        {t.name} {isTutorAssignedElsewhere(t.id, letter) ? '(Assigned elsewhere)' : ''}
                      </option>
                    ))}
                  </select>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleSaveClassFacilitator(letter)}
                    disabled={savingClassFacilitator === letter}
                  >
                    {savingClassFacilitator === letter ? 'Saving...' : 'Apply to Class ' + letter}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Registered Students ({allStudentsInTrack.length})
          </h4>
          
          {allStudentsInTrack.length > 0 ? (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Student Details</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Course / Track</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Class Group</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Current Facilitator</th>
                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudentsInTrack.map(s => {
                    const assignment = studentAssignments[s.id] || { classLetter: '', track: s.track || '' };
                    
                    // The actual facilitator name for this student based on their DB record
                    let currentTutorName = 'N/A';
                    if (s.assignedTutorId) {
                      const t = tutors.find(t => t.id === s.assignedTutorId);
                      if (t) currentTutorName = t.name;
                    }

                    const isTrackDirty = assignment.track !== s.track;
                    const isClassDirty = (assignment.classLetter !== (s.assignedClass ? s.assignedClass.match(/CLASS\s+([A-C])$/i)?.[1] || '' : ''));
                    const isDirty = isTrackDirty || isClassDirty;
                    
                    // Prevent class assignment if track is changed (force them to save transfer first)
                    const canAssignClass = !isTrackDirty;

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>
                          <strong>{s.name}</strong>
                          <br />
                          <small className="text-muted">{s.studentId}</small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            className="form-control"
                            value={assignment.track}
                            onChange={(e) => handleAssignmentChange(s.id, 'track', e.target.value)}
                            style={{ minWidth: '140px', backgroundColor: 'var(--bg-primary)' }}
                          >
                            <option value="">-- No Track --</option>
                            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            className="form-control"
                            value={assignment.classLetter}
                            onChange={(e) => handleAssignmentChange(s.id, 'classLetter', e.target.value)}
                            disabled={!canAssignClass}
                            style={{ minWidth: '120px', backgroundColor: canAssignClass ? 'var(--bg-primary)' : 'var(--bg-surface)' }}
                          >
                            <option value="">-- None --</option>
                            <option value="A">Class A</option>
                            <option value="B">Class B</option>
                            <option value="C">Class C</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {currentTutorName}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button 
                            className={`btn btn-sm ${isTrackDirty ? 'btn-danger' : 'btn-primary'}`}
                            disabled={savingId === s.id || processingDeleteId === s.id || (!assignment.classLetter && !isTrackDirty) || !isDirty}
                            onClick={() => handleSaveStudent(s)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {savingId === s.id ? 'Saving...' : (isTrackDirty ? 'Transfer' : <><Save size={14} /> Save</>)}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline"
                            disabled={processingDeleteId === s.id}
                            onClick={() => handleDeleteUser(s)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444', marginLeft: '4px' }}
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No registered students found for this course.</p>
            </div>
          )}
        </div>
      )}

      {/* Global Facilitator Approvals */}
      {(activeTab === 'all' || activeTab === 'facilitators') && (
        <div style={{ padding: '1.5rem', borderTop: activeTab === 'all' ? '1px solid var(--border-color)' : 'none' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Settings size={18} /> Facilitator Global Approval Rights
          </h4>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          By default, facilitators can only approve gate passes for students in their assigned class. 
          Enable global approval below to allow a facilitator to approve passes for any student in the camp.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {tutors.map(tutor => (
            <div key={tutor.id} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{tutor.name}</strong><br />
                <small className="text-muted">{tutor.studentId || 'Admin'}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${tutor.canApproveAll ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => handleToggleGlobalApproval(tutor)}
                  disabled={savingGlobalApprovalId === tutor.id || processingDeleteId === tutor.id}
                  style={{ minWidth: '130px' }}
                >
                  {savingGlobalApprovalId === tutor.id ? 'Saving...' : (tutor.canApproveAll ? 'Global Enabled' : 'Enable Global')}
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  disabled={processingDeleteId === tutor.id}
                  onClick={() => handleDeleteUser(tutor)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444' }}
                  title="Delete Facilitator"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Security Officers Configuration */}
      {(activeTab === 'all' || activeTab === 'security') && (
        <div style={{ padding: '1.5rem', borderTop: activeTab === 'all' ? '1px solid var(--border-color)' : 'none' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <ShieldAlert size={18} /> Security Officer Accounts
          </h4>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Activate or revoke access for security officers. New security accounts must be activated before they can clock in/out students.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {securityOfficers.map(sec => (
            <div key={sec.id} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{sec.name}</strong><br />
                <small className="text-muted">{sec.email || 'No email'}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${sec.isActivated ? 'btn-success' : 'btn-outline'}`}
                  onClick={() => handleToggleSecurityActivation(sec)}
                  disabled={savingSecurityId === sec.id || processingDeleteId === sec.id}
                  style={{ minWidth: '130px' }}
                >
                  {savingSecurityId === sec.id ? 'Saving...' : (sec.isActivated ? 'Access Granted' : 'Grant Access')}
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  disabled={processingDeleteId === sec.id}
                  onClick={() => handleDeleteUser(sec)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', border: '1px solid #ef4444', color: '#ef4444' }}
                  title="Delete Security Officer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {securityOfficers.length === 0 && (
            <div className="text-muted" style={{ fontStyle: 'italic' }}>No security officers found in the system.</div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
