import React, { useState, useEffect } from 'react';
import { subscribe } from '../mockFirebase';
import { CheckSquare, Calendar, Users, Bell, ArrowRight } from 'lucide-react';

export default function HomeView({ user, setActiveTab }) {
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const unsubTasks = subscribe('tasks', setTasks);
    const unsubAnns = subscribe('announcements', setAnnouncements);
    const unsubUsers = subscribe('users', setUsers);
    const unsubTeams = subscribe('teams', setTeams);

    return () => {
      unsubTasks();
      unsubAnns();
      unsubUsers();
      unsubTeams();
    };
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : '소속 없음';
  };

  // Filter tasks based on permission rules
  const personalTasks = tasks.filter(t => t.type === 'personal' && t.assigneeId === user.uid);
  const teamTasks = tasks.filter(t => t.type === 'team' && t.teamId === user.teamId);
  const allUserTasks = [...personalTasks, ...teamTasks];

  const todoTasks = allUserTasks.filter(t => t.status === 'todo');
  const inProgressTasks = allUserTasks.filter(t => t.status === 'in_progress');
  const doneTasks = allUserTasks.filter(t => t.status === 'done');

  // Filter announcements visible to user
  const visibleAnns = announcements.filter(a => a.teamId === null || a.teamId === user.teamId);

  // Filter members of same team
  const teamMembers = users.filter(u => u.teamId === user.teamId && u.uid !== user.uid && user.teamId !== null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 대시보드</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {user.role === 'admin' 
              ? '시스템 관리자 권한으로 대시보드를 검토 중입니다.'
              : `${getTeamName(user.teamId)} 소속의 ${user.displayName}님, 환영합니다.`
            }
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card glass" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tasks')}>
          <div className="card-icon bg-purple-soft">
            <CheckSquare size={24} />
          </div>
          <div className="card-val">{todoTasks.length}</div>
          <div className="card-lbl">해야 할 업무</div>
        </div>

        <div className="dash-card glass" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tasks')}>
          <div className="card-icon bg-blue-soft">
            <Calendar size={24} />
          </div>
          <div className="card-val">{inProgressTasks.length}</div>
          <div className="card-lbl">진행 중인 업무</div>
        </div>

        <div className="dash-card glass" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('tasks')}>
          <div className="card-icon bg-green-soft">
            <CheckSquare size={24} />
          </div>
          <div className="card-val">{doneTasks.length}</div>
          <div className="card-lbl">완료된 업무</div>
        </div>

        <div className="dash-card glass" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('announcements')}>
          <div className="card-icon bg-yellow-soft">
            <Bell size={24} />
          </div>
          <div className="card-val">{visibleAnns.length}</div>
          <div className="card-lbl">새 공지사항</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Side: Recent Announcements */}
        <div>
          <h3 className="card-section-title">
            <Bell size={18} style={{ color: 'var(--warning)' }} /> 최근 공지사항
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visibleAnns.length > 0 ? (
              visibleAnns.slice(0, 3).map(ann => (
                <div key={ann.id} className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{ann.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ann.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '500' }}>
                      작성자: {ann.createdByName}
                    </span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                      onClick={() => setActiveTab('announcements')}
                    >
                      상세 보기 <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Team Members */}
        <div>
          <h3 className="card-section-title">
            <Users size={18} style={{ color: 'var(--primary)' }} /> 같은 팀 구성원
          </h3>
          <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {user.role === 'admin' ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
                전체 회원 관리는 관리자 메뉴에서 가능합니다.
              </p>
            ) : teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <div key={member.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={member.photoURL} alt={member.displayName} className="assignee-avatar" style={{ width: '32px', height: '32px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{member.displayName}</div>
                      <span className={`user-role-badge role-${member.role}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={() => setActiveTab('dm')}
                  >
                    DM 보내기
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
                팀에 등록된 다른 구성원이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
