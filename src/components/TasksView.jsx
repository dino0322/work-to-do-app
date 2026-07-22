import React, { useState, useEffect } from 'react';
import { subscribe, mockDb } from '../mockFirebase';
import { Plus, Check, Play, Square, Trash2, Calendar, User, Eye, Edit2 } from 'lucide-react';

export default function TasksView({ user }) {
  const [subTab, setSubTab] = useState('personal'); // 'personal' | 'team'
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState(user.uid);
  const [newDueDate, setNewDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubTasks = subscribe('tasks', setTasks);
    const unsubUsers = subscribe('users', setUsers);
    const unsubTeams = subscribe('teams', setTeams);

    return () => {
      unsubTasks();
      unsubUsers();
      unsubTeams();
    };
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : '소속 없음';
  };

  const getAssigneeName = (assigneeId) => {
    const usr = users.find(u => u.uid === assigneeId);
    return usr ? usr.displayName : '미지정';
  };

  const getAssigneeAvatar = (assigneeId) => {
    const usr = users.find(u => u.uid === assigneeId);
    return usr ? usr.photoURL : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!newTitle.trim()) throw new Error('업무 제목을 입력해 주세요.');
      
      const taskData = {
        title: newTitle,
        description: newDesc,
        type: subTab,
        status: 'todo',
        assigneeId: subTab === 'personal' ? user.uid : newAssignee,
        teamId: subTab === 'personal' ? null : user.teamId,
        createdBy: user.uid,
        dueDate: newDueDate ? new Date(newDueDate).getTime() : Date.now() + 3600000 * 24
      };

      mockDb.addTask(taskData);
      
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewAssignee(user.uid);
      setNewDueDate('');
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    mockDb.updateTaskStatus(taskId, newStatus);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('이 업무를 정말로 삭제하시겠습니까?')) {
      mockDb.deleteTask(taskId);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    if (subTab === 'personal') {
      return task.type === 'personal' && task.assigneeId === user.uid;
    } else {
      // Team tasks:
      // Members/Leaders can only see tasks of their own team.
      // Admin can see all team tasks.
      if (user.role === 'admin') {
        return task.type === 'team';
      }
      return task.type === 'team' && task.teamId === user.teamId;
    }
  });

  // Permission settings
  // Team Leader and Admin can create team tasks. Member/Guest cannot.
  const canManageTeamTasks = user.role === 'leader' || user.role === 'admin';
  const canCreate = subTab === 'personal' || (subTab === 'team' && canManageTeamTasks);

  // Users available for assignee dropdown (only members of same team for team tasks, or self for admin)
  const teamMembers = users.filter(u => u.teamId === user.teamId && u.role !== 'guest');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 업무 관리</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            개인 및 소속 팀의 업무 진행 상황을 확인하고 관리합니다.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> 업무 신규 등록
          </button>
        )}
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${subTab === 'personal' ? 'active' : ''}`}
          onClick={() => setSubTab('personal')}
        >
          👤 개인 업무 ({tasks.filter(t => t.type === 'personal' && t.assigneeId === user.uid).length})
        </button>
        <button 
          className={`tab-btn ${subTab === 'team' ? 'active' : ''}`}
          onClick={() => setSubTab('team')}
        >
          👥 팀 업무 ({
            user.role === 'admin' 
              ? tasks.filter(t => t.type === 'team').length 
              : tasks.filter(t => t.type === 'team' && t.teamId === user.teamId).length
          })
        </button>
      </div>

      {subTab === 'team' && user.teamId === null && user.role !== 'admin' ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          소속된 팀이 없습니다. 게스트 권한을 활성화하거나 팀 배정을 요청하세요.
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="tasks-grid">
          {filteredTasks.map(task => {
            // Who can edit this specific task's status?
            // The assignee of the task, or the Creator/Leader/Admin.
            const isAssignee = task.assigneeId === user.uid;
            const isCreator = task.createdBy === user.uid;
            const isTeamLeader = user.role === 'leader' && task.teamId === user.teamId;
            const isWorkspaceAdmin = user.role === 'admin';
            const canChangeStatus = isAssignee || isCreator || isTeamLeader || isWorkspaceAdmin;
            const canDelete = isCreator || isTeamLeader || isWorkspaceAdmin;

            return (
              <div key={task.id} className="glass task-card">
                <div className="task-header">
                  <span className={`task-status-badge status-${task.status}`}>
                    {task.status === 'todo' && '대기'}
                    {task.status === 'in_progress' && '진행중'}
                    {task.status === 'done' && '완료'}
                  </span>
                  
                  {canDelete && (
                    <button 
                      className="logout-btn" 
                      style={{ padding: '4px' }} 
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>
                </div>

                <div className="task-meta">
                  <div className="assignee-info">
                    <img 
                      src={getAssigneeAvatar(task.assigneeId)} 
                      alt="avatar" 
                      className="assignee-avatar" 
                    />
                    <span>{getAssigneeName(task.assigneeId)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {canChangeStatus && (
                  <div className="task-actions">
                    {task.status !== 'todo' && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '11px', flex: 1, justifyContent: 'center' }}
                        onClick={() => handleUpdateStatus(task.id, 'todo')}
                      >
                        <Square size={12} /> 대기 전환
                      </button>
                    )}
                    {task.status !== 'in_progress' && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '11px', flex: 1, justifyContent: 'center' }}
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      >
                        <Play size={12} /> 진행 전환
                      </button>
                    )}
                    {task.status !== 'done' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '11px', flex: 1, justifyContent: 'center' }}
                        onClick={() => handleUpdateStatus(task.id, 'done')}
                      >
                        <Check size={12} /> 완료 완료
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          등록된 업무가 없습니다. 새로운 업무를 등록하여 생산성을 높여보세요!
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <div className="modal-header">
              <h2 className="modal-title">
                {subTab === 'personal' ? '👤 개인 업무 추가' : '👥 팀 업무 추가'}
              </h2>
              <button 
                className="logout-btn" 
                style={{ fontSize: '18px', fontWeight: 'bold' }} 
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">업무 제목</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 홈페이지 시안 시뮬레이션 검토"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">업무 상세 내용</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  style={{ resize: 'none' }}
                  placeholder="상세 작업 내용 및 유의 사항을 기입하세요."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              {subTab === 'team' && (
                <div className="form-group">
                  <label className="form-label">업무 담당자 지정</label>
                  <select 
                    className="form-input"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  >
                    {teamMembers.map(m => (
                      <option key={m.uid} value={m.uid}>
                        {m.displayName} ({m.role})
                      </option>
                    ))}
                    {user.role === 'admin' && (
                      <option value={user.uid}>{user.displayName} (Admin/본인)</option>
                    )}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">기한 설정</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
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
                  업무 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
