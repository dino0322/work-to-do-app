import React, { useState, useEffect } from 'react';
import { subscribe, mockDb } from '../mockFirebase';
import { Plus, Bell, Trash2, Megaphone } from 'lucide-react';

export default function AnnouncementsView({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('global'); // 'global' | specific teamId
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubAnns = subscribe('announcements', setAnnouncements);
    const unsubTeams = subscribe('teams', setTeams);

    return () => {
      unsubAnns();
      unsubTeams();
    };
  }, []);

  const handlePost = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error('제목과 내용을 모두 기입해 주세요.');
      }

      const teamId = targetTeamId === 'global' ? null : targetTeamId;
      mockDb.addAnnouncement(title, content, user.uid, user.displayName, teamId);
      
      setTitle('');
      setContent('');
      setTargetTeamId('global');
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('이 공지사항을 정말 삭제하시겠습니까?')) {
      mockDb.deleteAnnouncement(id);
    }
  };

  // Filter announcements
  // User can see global announcements (teamId === null) OR announcements matching their teamId.
  // Admin can see everything.
  const visibleAnns = announcements.filter(ann => {
    if (user.role === 'admin') return true;
    return ann.teamId === null || ann.teamId === user.teamId;
  });

  const canPost = user.role === 'leader' || user.role === 'admin';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📢 공지사항</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            사내 전체 공지 및 팀별 전달 사항을 확인합니다.
          </p>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> 공지 작성하기
          </button>
        )}
      </div>

      <div className="ann-feed">
        {visibleAnns.length > 0 ? (
          visibleAnns.map((ann) => {
            const isCreator = ann.createdBy === user.uid;
            const isWorkspaceAdmin = user.role === 'admin';
            const canDelete = isCreator || isWorkspaceAdmin;

            return (
              <div key={ann.id} className="glass ann-card">
                <div className="ann-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Megaphone size={18} style={{ color: ann.teamId ? 'var(--primary)' : 'var(--warning)' }} />
                    <h3 className="ann-card-title">{ann.title}</h3>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: ann.teamId ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        border: ann.teamId ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(245,158,11,0.2)',
                        color: ann.teamId ? '#a5b4fc' : '#fde047'
                      }}
                    >
                      {ann.teamId ? '팀 공지' : '전사 공지'}
                    </span>
                  </div>
                  
                  {canDelete && (
                    <button 
                      className="logout-btn" 
                      style={{ padding: '4px' }} 
                      onClick={() => handleDelete(ann.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="ann-meta-text">
                  작성자: <strong style={{ color: 'var(--text-primary)' }}>{ann.createdByName}</strong> | 등록일: {new Date(ann.createdAt).toLocaleString()}
                </div>

                <p className="ann-content">{ann.content}</p>
              </div>
            );
          })
        ) : (
          <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            등록된 공지사항이 아직 없습니다.
          </div>
        )}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <div className="modal-header">
              <h2 className="modal-title">📢 신규 공지 작성</h2>
              <button 
                className="logout-btn" 
                style={{ fontSize: '18px', fontWeight: 'bold' }} 
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handlePost}>
              <div className="form-group">
                <label className="form-label">공지 제목</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 긴급 시스템 메인터넌스 스케줄 안내"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">공지 대상 설정</label>
                <select 
                  className="form-input"
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  disabled={user.role === 'leader'} // Team leaders can only announce to their own team
                >
                  {user.role === 'admin' ? (
                    <>
                      <option value="global">전체 사원 (Global)</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </>
                  ) : (
                    <option value={user.teamId}>{teams.find(t => t.id === user.teamId)?.name || '내 팀'}</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">공지 내용</label>
                <textarea 
                  className="form-input" 
                  rows="6" 
                  style={{ resize: 'none' }}
                  placeholder="전달하고자 하는 내용을 상세히 작성해 주세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  공지 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
