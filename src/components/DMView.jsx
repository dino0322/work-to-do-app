import React, { useState, useEffect, useRef } from 'react';
import { subscribe, mockDb } from '../mockFirebase';
import { Send, MessageSquare, Plus, Search, User } from 'lucide-react';

export default function DMView({ user }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubChats = subscribe('chats', setChats);
    const unsubMsgs = subscribe('messages', setMessages);
    const unsubUsers = subscribe('users', setUsers);

    return () => {
      unsubChats();
      unsubMsgs();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPartnerUser = (chat) => {
    const partnerId = chat.participants.find(p => p !== user.uid);
    return users.find(u => u.uid === partnerId) || { displayName: '탈퇴한 사용자', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80', role: 'guest' };
  };

  const getChatMessages = () => {
    if (!activeChat) return [];
    return messages.filter(m => m.chatId === activeChat.id);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    mockDb.sendMessage(activeChat.id, user.uid, messageText.trim());
    setMessageText('');
  };

  const handleStartChat = (targetUser) => {
    const chat = mockDb.startChat(user.uid, targetUser.uid);
    setActiveChat(chat);
    setShowNewChatModal(false);
    setSearchTerm('');
  };

  // Filter users to start a new chat (exclude self, and must not be guests if the user is a guest, but guest can only DM leaders/admins)
  // Actually, let's allow starting chat with anyone in the workspace (except guest can only start chats with members/leaders/admins, and vice versa).
  const filteredUsers = users.filter(u => {
    if (u.uid === user.uid) return false;
    if (u.role === 'guest') return false; // Hide guest from DM initiation list to prevent guest spam
    return u.displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter chats the current user is participating in
  const userChats = chats.filter(c => c.participants.includes(user.uid));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">💬 다이렉트 메시지 (DM)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            사내 동료들과 실시간 인스타그램 스타일의 다이렉트 메시지를 주고받습니다.
          </p>
        </div>
      </div>

      <div className="dm-container glass">
        {/* Left Column: Chats list */}
        <div className="dm-sidebar">
          <div className="dm-sidebar-header">
            <span>메시지함</span>
            <button 
              className="logout-btn" 
              style={{ padding: '6px', borderRadius: '50%' }}
              onClick={() => setShowNewChatModal(true)}
              title="새 채팅 시작"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="dm-conversations-list">
            {userChats.length > 0 ? (
              userChats.map(chat => {
                const partner = getPartnerUser(chat);
                const isActive = activeChat && activeChat.id === chat.id;
                return (
                  <div 
                    key={chat.id} 
                    className={`dm-chat-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <img src={partner.photoURL} alt={partner.displayName} className="dm-chat-avatar" />
                    <div className="dm-chat-meta">
                      <div className="dm-chat-name">{partner.displayName}</div>
                      <div className="dm-chat-preview">{chat.lastMessage || '새 대화가 시작되었습니다.'}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                활성화된 대화가 없습니다.<br />우측 상단의 [+] 버튼을 눌러보세요.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Main Area */}
        <div className="dm-main">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="dm-main-header">
                <img 
                  src={getPartnerUser(activeChat).photoURL} 
                  alt="avatar" 
                  className="dm-chat-avatar" 
                  style={{ width: '36px', height: '36px' }}
                />
                <div>
                  <div className="dm-main-header-name">{getPartnerUser(activeChat).displayName}</div>
                  <span className={`user-role-badge role-${getPartnerUser(activeChat).role}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                    {getPartnerUser(activeChat).role}
                  </span>
                </div>
              </div>

              {/* Messages display */}
              <div className="dm-messages-area">
                {getChatMessages().map(msg => {
                  const isSentByMe = msg.senderId === user.uid;
                  return (
                    <div 
                      key={msg.id} 
                      className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        {msg.text}
                      </div>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="dm-input-area">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="메시지를 입력하세요..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
              <h3>Instagram-like Direct Messages</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                채팅방을 선택하거나 새 대화를 시작해 동료와 메시지를 나누세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Start New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <div className="modal-header">
              <h2 className="modal-title">💬 새로운 채팅방 생성</h2>
              <button 
                className="logout-btn" 
                style={{ fontSize: '18px', fontWeight: 'bold' }} 
                onClick={() => setShowNewChatModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="사용자명 검색..."
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>

            <div className="user-select-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <div 
                    key={u.uid} 
                    className="user-select-item"
                    onClick={() => handleStartChat(u)}
                  >
                    <img src={u.photoURL} alt={u.displayName} className="dm-chat-avatar" style={{ width: '32px', height: '32px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{u.displayName}</div>
                      <span className={`user-role-badge role-${u.role}`} style={{ fontSize: '8px', padding: '1px 3px' }}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  해당 이름의 멤버를 찾을 수 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
