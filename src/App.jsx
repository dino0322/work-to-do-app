import React, { useState, useEffect } from 'react';
import { subscribe, mockAuth } from './mockFirebase';
import LoginView from './components/LoginView';
import GuestView from './components/GuestView';
import HomeView from './components/HomeView';
import TasksView from './components/TasksView';
import AnnouncementsView from './components/AnnouncementsView';
import DMView from './components/DMView';
import AdminView from './components/AdminView';
import { Home, CheckSquare, Bell, MessageSquare, ShieldAlert, LogOut, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'tasks' | 'announcements' | 'dm' | 'admin'

  useEffect(() => {
    // Subscribe to simulated real-time authentication session state
    const unsubAuth = subscribe('auth', (currentUser) => {
      setUser(currentUser);
      // Reset active tab to home when user session changes
      setActiveTab('home');
    });

    return () => unsubAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleCodeRedeemed = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    mockAuth.logout();
  };

  // 1. If not authenticated, show login screen
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. If user is guest, lock them in the GuestView (no sidebar, no navigation)
  if (user.role === 'guest') {
    return <GuestView user={user} onCodeRedeemed={handleCodeRedeemed} />;
  }

  // 3. Authenticated Layout (Admin, Leader, Member)
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <span>✅ Work To Do</span>
        </div>

        <nav className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>대시보드</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} />
            <span>업무 관리</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={18} />
            <span>공지사항</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'dm' ? 'active' : ''}`}
            onClick={() => setActiveTab('dm')}
          >
            <MessageSquare size={18} />
            <span>메시지함 (DM)</span>
          </div>

          {/* Admin panel menu link (only visible to Admin) */}
          {user.role === 'admin' && (
            <div 
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '16px', borderRadius: 0 }}
            >
              <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>관리자 메뉴</span>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="user-profile-section">
          <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
          <div className="user-details">
            <div className="user-name">{user.displayName}</div>
            <span className={`user-role-badge role-${user.role}`}>
              {user.role}
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="로그아웃">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'home' && <HomeView user={user} setActiveTab={setActiveTab} />}
        {activeTab === 'tasks' && <TasksView user={user} />}
        {activeTab === 'announcements' && <AnnouncementsView user={user} />}
        {activeTab === 'dm' && <DMView user={user} />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminView />}
      </main>
    </div>
  );
}
