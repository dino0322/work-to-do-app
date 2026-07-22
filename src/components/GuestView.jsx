import React, { useState } from 'react';
import { mockAuth } from '../mockFirebase';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function GuestView({ user, onCodeRedeemed }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!code) throw new Error('초대 코드를 입력해 주세요.');
      const updatedUser = mockAuth.redeemInviteCode(code.trim());
      setSuccess(`성공적으로 인증되었습니다! 역할: ${updatedUser.role.toUpperCase()}`);
      setTimeout(() => {
        onCodeRedeemed(updatedUser);
      }, 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="guest-card glass">
        <div className="guest-icon-wrapper">
          <ShieldAlert size={32} />
        </div>
        <h2 className="auth-title" style={{ marginBottom: '12px' }}>접근 제한됨</h2>
        <p className="auth-subtitle" style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          안녕하세요, <strong>{user.displayName}</strong>님!<br />
          현재 게스트 등급으로 가입되어 있어 대시보드 진입이 불가합니다. 소속 팀장 또는 관리자에게 발급받은 <strong>초대 코드</strong>를 입력해 권한을 활성화해 주세요.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">초대 코드 입력</label>
            <input
              type="text"
              className="form-input"
              style={{ textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '18px', fontWeight: 'bold' }}
              placeholder="CODE123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <KeyRound size={16} /> 초대 코드 인증하기
          </button>
        </form>

        <div className="test-accounts-divider">
          <span>테스트용 초대 코드</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🎨 디자인 팀원 가입:</span>
            <code className="code-badge" style={{ fontSize: '11px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>MEMBER123</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>💻 개발 팀장 가입:</span>
            <code className="code-badge" style={{ fontSize: '11px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>LEADER123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
