import React, { useState } from 'react';
import { mockAuth } from '../mockFirebase';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const testAccounts = [
    { email: 'admin@workspace.com', label: 'Admin (김관리)', role: 'admin' },
    { email: 'leader@workspace.com', label: 'Leader (박팀장)', role: 'leader' },
    { email: 'member@workspace.com', label: 'Member (이민우)', role: 'member' },
    { email: 'guest@workspace.com', label: 'Guest (최게스트)', role: 'guest' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!email) throw new Error('이메일을 입력해 주세요.');
      const user = mockAuth.login(email.trim());
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!email || !name) throw new Error('이름과 이메일을 모두 입력해 주세요.');
      const user = mockAuth.signupAsGuest(email.trim(), name.trim());
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTestLogin = (testEmail) => {
    setError('');
    try {
      const user = mockAuth.login(testEmail);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <span>✅ Work To Do</span>
          </div>
          <h2 className="auth-title">협업 업무 관리 시스템</h2>
          <p className="auth-subtitle">
            {isSignup ? '게스트 계정으로 새로 가입합니다' : '워크스페이스 이메일로 로그인하세요'}
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {isSignup ? (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="form-input"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@workspace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              <UserPlus size={16} /> 게스트로 가입 신청
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">이메일 주소</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@workspace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
              <LogIn size={16} /> 로그인
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
          >
            {isSignup ? '기존 계정으로 로그인' : '게스트로 새로 가입하기'}
          </button>
        </div>

        <div className="test-accounts-divider">
          <span>또는 빠른 테스트 계정 선택</span>
        </div>

        <div className="test-accounts-grid">
          {testAccounts.map((acc) => (
            <button
              key={acc.email}
              className="test-acc-btn"
              onClick={() => handleTestLogin(acc.email)}
            >
              <span className={`test-acc-role user-role-badge role-${acc.role}`}>
                {acc.role}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                {acc.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
