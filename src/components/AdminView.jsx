import React, { useState, useEffect } from 'react';
import { subscribe, mockDb } from '../mockFirebase';
import { Users, Key, Plus, Trash2, Shield } from 'lucide-react';

export default function AdminView() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [inviteCodes, setInviteCodes] = useState({});

  // Code form states
  const [newCode, setNewCode] = useState('');
  const [targetRole, setTargetRole] = useState('member');
  const [targetTeamId, setTargetTeamId] = useState('design-team');
  const [maxUses, setMaxUses] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubUsers = subscribe('users', setUsers);
    const unsubTeams = subscribe('teams', setTeams);
    const unsubCodes = subscribe('inviteCodes', setInviteCodes);

    return () => {
      unsubUsers();
      unsubTeams();
      unsubCodes();
    };
  }, []);

  const handleRoleChange = (uid, role, teamId) => {
    try {
      mockDb.updateUserRole(uid, role, teamId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCode = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!newCode.trim()) throw new Error('생성할 초대 코드를 입력해 주세요.');
      if (newCode.length < 4) throw new Error('초대 코드는 최소 4자 이상이어야 합니다.');
      
      mockDb.createInviteCode(newCode.trim(), targetRole, targetTeamId, maxUses);
      setSuccess(`초대 코드 '${newCode.toUpperCase()}'가 생성되었습니다.`);
      setNewCode('');
      setMaxUses(5);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCode = (code) => {
    if (window.confirm(`초대 코드 '${code}'를 삭제하시겠습니까?`)) {
      mockDb.deleteInviteCode(code);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ 시스템 관리자 패널</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            사원들의 가입 승인, 역할 배정, 부서 설정 및 인증 초대 코드를 생성·관리합니다.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        {/* Left Side: Users Management */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 className="card-section-title" style={{ marginBottom: '20px' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} /> 사원 관리 및 역할 관리
          </h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>직급/역할</th>
                  <th>소속 부서</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={u.photoURL} alt="avatar" className="assignee-avatar" style={{ width: '28px', height: '28px' }} />
                        <span style={{ fontWeight: '500' }}>{u.displayName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ padding: '6px 10px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.02)' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value, u.teamId)}
                      >
                        <option value="admin">Admin</option>
                        <option value="leader">Leader</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ padding: '6px 10px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.02)' }}
                        value={u.teamId || ''}
                        onChange={(e) => handleRoleChange(u.uid, u.role, e.target.value || null)}
                        disabled={u.role === 'guest' || u.role === 'admin'}
                      >
                        <option value="">소속 없음</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Invite Codes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create Code Form */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="card-section-title">
              <Key size={18} style={{ color: 'var(--warning)' }} /> 초대 코드 생성
            </h3>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleCreateCode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">초대 코드명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: DEVLEADER2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">부여할 직급/권한</label>
                <select 
                  className="form-input"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="leader">Leader (팀장)</option>
                  <option value="member">Member (팀원)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">부여할 부서</label>
                <select 
                  className="form-input"
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">최대 사용 횟수 제한</label>
                <input 
                  type="number" 
                  className="form-input"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
                <Plus size={16} /> 코드 발급
              </button>
            </form>
          </div>

          {/* Active codes list */}
          <div className="glass" style={{ padding: '24px', flex: 1 }}>
            <h3 className="card-section-title">
              <Shield size={18} style={{ color: 'var(--success)' }} /> 활성 초대 코드 목록
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {Object.values(inviteCodes).length > 0 ? (
                Object.values(inviteCodes).map((c) => (
                  <div key={c.code} className="code-list-item">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="code-badge">{c.code}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ({c.role.toUpperCase()} / {teams.find(t => t.id === c.teamId)?.name.split(' ')[1] || '부서'})
                        </span>
                      </div>
                      <span className="code-details">
                        사용 횟수: <strong>{c.usedCount}</strong> / {c.maxUses}회
                      </span>
                    </div>
                    <button 
                      className="logout-btn" 
                      style={{ padding: '6px' }}
                      onClick={() => handleDeleteCode(c.code)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  활성화된 초대 코드가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
