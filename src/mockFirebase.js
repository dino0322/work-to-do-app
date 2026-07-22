// Mock Firebase Service simulating Firebase Auth & Firestore

const KEY_PREFIX = 'worktodo_mock_';

const defaultTeams = {
  'design-team': { id: 'design-team', name: '🎨 디자인 팀' },
  'dev-team': { id: 'dev-team', name: '💻 개발 팀' }
};

const defaultUsers = {
  'admin': {
    uid: 'admin',
    email: 'admin@workspace.com',
    displayName: '김관리 (Admin)',
    role: 'admin',
    teamId: null,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: Date.now()
  },
  'leader': {
    uid: 'leader',
    email: 'leader@workspace.com',
    displayName: '박팀장 (Leader)',
    role: 'leader',
    teamId: 'design-team',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: Date.now()
  },
  'member': {
    uid: 'member',
    email: 'member@workspace.com',
    displayName: '이민우 (Member)',
    role: 'member',
    teamId: 'design-team',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: Date.now()
  },
  'guest': {
    uid: 'guest',
    email: 'guest@workspace.com',
    displayName: '최게스트 (Guest)',
    role: 'guest',
    teamId: null,
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: Date.now()
  }
};

const defaultInviteCodes = {
  'LEADER123': { code: 'LEADER123', role: 'leader', teamId: 'dev-team', active: true, maxUses: 5, usedCount: 1 },
  'MEMBER123': { code: 'MEMBER123', role: 'member', teamId: 'design-team', active: true, maxUses: 10, usedCount: 3 }
};

const defaultAnnouncements = [
  {
    id: 'ann-1',
    title: '📢 신규 업무 관리 시스템 가동 안내',
    content: '오늘부로 새로운 Supabase/Firebase 기반 업무 관리 시스템의 프로토타입 가동을 시작합니다. 건의 사항은 DM 또는 관리자 권한 메뉴를 통해 전달 바랍니다.',
    createdBy: 'admin',
    createdByName: '김관리 (Admin)',
    teamId: null, // Global
    createdAt: Date.now() - 3600000 * 24 // 24 hours ago
  },
  {
    id: 'ann-2',
    title: '🎨 디자인 가이드라인 리뷰 요청',
    content: '디자인 팀원 여러분은 금주 금요일까지 브랜드 아이덴티티 변경 건에 따른 디자인 가이드라인을 확인해 주시고 의견을 작성해 주세요.',
    createdBy: 'leader',
    createdByName: '박팀장 (Leader)',
    teamId: 'design-team',
    createdAt: Date.now() - 3600000 * 6 // 6 hours ago
  }
];

const defaultTasks = [
  {
    id: 'task-1',
    title: '디자인 가이드라인 초안 작성',
    description: '디자인 가이드의 폰트 및 컬러 스펙 초안을 노션에 정리합니다.',
    type: 'personal',
    status: 'todo',
    assigneeId: 'member',
    teamId: null,
    createdBy: 'member',
    createdAt: Date.now() - 3600000 * 12,
    dueDate: Date.now() + 3600000 * 48
  },
  {
    id: 'task-2',
    title: '메인 대시보드 UI/UX 완성',
    description: '글래스모피즘 테마를 적용하여 반응형 대시보드 목업을 피그마에 작업합니다.',
    type: 'team',
    status: 'in_progress',
    assigneeId: 'member',
    teamId: 'design-team',
    createdBy: 'leader',
    createdAt: Date.now() - 3600000 * 24,
    dueDate: Date.now() + 3600000 * 72
  },
  {
    id: 'task-3',
    title: '브랜드 컬러 가이드 확정',
    description: '임원 회의 통과 후 디자인 팀 최종 컬러 팔레트를 확정합니다.',
    type: 'team',
    status: 'done',
    assigneeId: 'leader',
    teamId: 'design-team',
    createdBy: 'leader',
    createdAt: Date.now() - 3600000 * 48,
    dueDate: Date.now() - 3600000 * 2
  }
];

const defaultChats = [
  {
    id: 'chat-member-leader',
    participants: ['member', 'leader'],
    lastMessage: '팀장님 피드백 감사드립니다! 바로 수정해 올리겠습니다.',
    lastMessageAt: Date.now() - 3600000
  }
];

const defaultMessages = [
  {
    id: 'msg-1',
    chatId: 'chat-member-leader',
    senderId: 'leader',
    text: '안녕하세요 민우씨, 메인 대시보드 1차 디자인 시안 검토해 보았습니다. 전체적으로 고급스러운데 카드 영역의 텍스트가 약간 작게 보이는 것 같습니다. 폰트 웨이트를 조금 높여보는게 어떨까요?',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'msg-2',
    chatId: 'chat-member-leader',
    senderId: 'member',
    text: '팀장님 피드백 감사드립니다! 바로 수정해 올리겠습니다.',
    createdAt: Date.now() - 3600000
  }
];

// LocalStorage Helpers
const getStorage = (key, fallback) => {
  const data = localStorage.getItem(KEY_PREFIX + key);
  if (!data) {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
};

const setStorage = (key, val) => {
  localStorage.setItem(KEY_PREFIX + key, JSON.stringify(val));
  notify(key);
};

// Subscriptions for simulated real-time updates
const listeners = {};
export const subscribe = (key, callback) => {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  
  // Initial fire
  let initialData;
  if (key === 'auth') initialData = getAuthSession();
  else if (key === 'users') initialData = getStorage('users', defaultUsers);
  else if (key === 'teams') initialData = getStorage('teams', defaultTeams);
  else if (key === 'tasks') initialData = getStorage('tasks', defaultTasks);
  else if (key === 'announcements') initialData = getStorage('announcements', defaultAnnouncements);
  else if (key === 'chats') initialData = getStorage('chats', defaultChats);
  else if (key === 'messages') initialData = getStorage('messages', defaultMessages);
  else if (key === 'inviteCodes') initialData = getStorage('inviteCodes', defaultInviteCodes);
  
  callback(initialData);
  
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
};

const notify = (key) => {
  if (listeners[key]) {
    let freshData;
    if (key === 'auth') freshData = getAuthSession();
    else if (key === 'users') freshData = getStorage('users', defaultUsers);
    else if (key === 'teams') freshData = getStorage('teams', defaultTeams);
    else if (key === 'tasks') freshData = getStorage('tasks', defaultTasks);
    else if (key === 'announcements') freshData = getStorage('announcements', defaultAnnouncements);
    else if (key === 'chats') freshData = getStorage('chats', defaultChats);
    else if (key === 'messages') freshData = getStorage('messages', defaultMessages);
    else if (key === 'inviteCodes') freshData = getStorage('inviteCodes', defaultInviteCodes);
    
    listeners[key].forEach(cb => cb(freshData));
  }
};

const getAuthSession = () => {
  const session = localStorage.getItem(KEY_PREFIX + 'session');
  return session ? JSON.parse(session) : null;
};

// Auth Functions
export const mockAuth = {
  getCurrentUser: () => getAuthSession(),
  
  login: (email) => {
    const users = getStorage('users', defaultUsers);
    const user = Object.values(users).find(u => u.email === email);
    if (!user) throw new Error('등록되지 않은 이메일입니다. 가입을 먼저 진행하거나 테스트용 이메일을 사용해 주세요.');
    
    localStorage.setItem(KEY_PREFIX + 'session', JSON.stringify(user));
    notify('auth');
    return user;
  },

  signupAsGuest: (email, name) => {
    const users = getStorage('users', defaultUsers);
    const emailExists = Object.values(users).some(u => u.email === email);
    if (emailExists) throw new Error('이미 등록된 이메일입니다.');

    const newUid = 'guest_' + Math.random().toString(36).substr(2, 9);
    const newGuest = {
      uid: newUid,
      email,
      displayName: name,
      role: 'guest',
      teamId: null,
      photoURL: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1570295999919-56ceb5ecca61', '1438761681033-6461ffad8d80'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=150&h=150&q=80`,
      createdAt: Date.now()
    };

    users[newUid] = newGuest;
    setStorage('users', users);
    
    localStorage.setItem(KEY_PREFIX + 'session', JSON.stringify(newGuest));
    notify('auth');
    return newGuest;
  },

  logout: () => {
    localStorage.removeItem(KEY_PREFIX + 'session');
    notify('auth');
  },

  redeemInviteCode: (code) => {
    const session = getAuthSession();
    if (!session) throw new Error('로그인 세션이 만료되었습니다.');

    const inviteCodes = getStorage('inviteCodes', defaultInviteCodes);
    const targetCode = inviteCodes[code.toUpperCase()];

    if (!targetCode || !targetCode.active) {
      throw new Error('유효하지 않거나 비활성화된 초대 코드입니다.');
    }

    if (targetCode.usedCount >= targetCode.maxUses) {
      throw new Error('사용 가능한 횟수를 초과한 초대 코드입니다.');
    }

    // Update invite code usage
    targetCode.usedCount += 1;
    setStorage('inviteCodes', inviteCodes);

    // Update user role and team
    const users = getStorage('users', defaultUsers);
    users[session.uid].role = targetCode.role;
    users[session.uid].teamId = targetCode.teamId;
    setStorage('users', users);

    // Update session
    const updatedUser = users[session.uid];
    localStorage.setItem(KEY_PREFIX + 'session', JSON.stringify(updatedUser));
    notify('auth');
    
    return updatedUser;
  }
};

// Firestore Functions
export const mockDb = {
  getUsers: () => Object.values(getStorage('users', defaultUsers)),
  
  getTeams: () => Object.values(getStorage('teams', defaultTeams)),
  
  updateUserRole: (uid, role, teamId) => {
    const users = getStorage('users', defaultUsers);
    if (!users[uid]) throw new Error('사용자를 찾을 수 없습니다.');
    
    users[uid].role = role;
    users[uid].teamId = teamId;
    setStorage('users', users);

    // If updated user is current session, sync it
    const session = getAuthSession();
    if (session && session.uid === uid) {
      localStorage.setItem(KEY_PREFIX + 'session', JSON.stringify(users[uid]));
      notify('auth');
    }
  },

  createInviteCode: (code, role, teamId, maxUses) => {
    const inviteCodes = getStorage('inviteCodes', defaultInviteCodes);
    const upperCode = code.toUpperCase();
    if (inviteCodes[upperCode]) throw new Error('이미 존재하는 코드입니다.');

    inviteCodes[upperCode] = {
      code: upperCode,
      role,
      teamId,
      maxUses: parseInt(maxUses) || 5,
      usedCount: 0,
      active: true
    };
    setStorage('inviteCodes', inviteCodes);
  },

  deleteInviteCode: (code) => {
    const inviteCodes = getStorage('inviteCodes', defaultInviteCodes);
    delete inviteCodes[code];
    setStorage('inviteCodes', inviteCodes);
  },

  // Task APIs
  getTasks: () => getStorage('tasks', defaultTasks),

  addTask: (taskData) => {
    const tasks = getStorage('tasks', defaultTasks);
    const newTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      ...taskData
    };
    tasks.unshift(newTask);
    setStorage('tasks', tasks);
    return newTask;
  },

  updateTaskStatus: (taskId, status) => {
    const tasks = getStorage('tasks', defaultTasks);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].status = status;
      setStorage('tasks', tasks);
    }
  },

  deleteTask: (taskId) => {
    const tasks = getStorage('tasks', defaultTasks);
    const filtered = tasks.filter(t => t.id !== taskId);
    setStorage('tasks', filtered);
  },

  // Announcement APIs
  getAnnouncements: () => getStorage('announcements', defaultAnnouncements),

  addAnnouncement: (title, content, createdBy, displayName, teamId) => {
    const announcements = getStorage('announcements', defaultAnnouncements);
    const newAnn = {
      id: 'ann_' + Math.random().toString(36).substr(2, 9),
      title,
      content,
      createdBy,
      createdByName: displayName,
      teamId: teamId || null,
      createdAt: Date.now()
    };
    announcements.unshift(newAnn);
    setStorage('announcements', announcements);
    return newAnn;
  },

  deleteAnnouncement: (id) => {
    const announcements = getStorage('announcements', defaultAnnouncements);
    const filtered = announcements.filter(a => a.id !== id);
    setStorage('announcements', filtered);
  },

  // DM / Message APIs
  getChats: () => getStorage('chats', defaultChats),
  getMessages: () => getStorage('messages', defaultMessages),

  startChat: (user1, user2) => {
    const chats = getStorage('chats', defaultChats);
    let chat = chats.find(c => 
      c.participants.includes(user1) && c.participants.includes(user2)
    );

    if (!chat) {
      chat = {
        id: `chat_${user1}_${user2}`,
        participants: [user1, user2],
        lastMessage: '',
        lastMessageAt: Date.now()
      };
      chats.push(chat);
      setStorage('chats', chats);
    }
    return chat;
  },

  sendMessage: (chatId, senderId, text) => {
    const messages = getStorage('messages', defaultMessages);
    const chats = getStorage('chats', defaultChats);

    const newMsg = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      chatId,
      senderId,
      text,
      createdAt: Date.now()
    };

    messages.push(newMsg);
    setStorage('messages', messages);

    // Update last message in chat
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex > -1) {
      chats[chatIndex].lastMessage = text;
      chats[chatIndex].lastMessageAt = Date.now();
      setStorage('chats', chats);
    }

    return newMsg;
  }
};
