import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/messenger/Sidebar';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsPanel from '@/components/messenger/ContactsPanel';
import SearchPanel from '@/components/messenger/SearchPanel';
import ProfilePanel from '@/components/messenger/ProfilePanel';
import EmptyState from '@/components/messenger/EmptyState';
import NotificationToast from '@/components/messenger/NotificationToast';
import AuthScreen from '@/components/messenger/AuthScreen';
import { api } from '@/lib/api';

export interface RealChat {
  id: string;
  name: string;
  avatar: string;
  color: string;
  is_group: boolean;
  members_count: number;
  last_message: string;
  last_message_at: string | null;
  unread: number;
}

export interface RealMessage {
  id: string;
  text: string;
  time: string;
  created_at: string;
  is_own: boolean;
  status: string;
  reactions: { emoji: string; count: number; mine: boolean }[];
  sender: { id: string; display_name: string; avatar_initials: string; avatar_color: string };
}

export default function Index() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<RealChat | null>(null);
  const [currentUser, setCurrentUser] = useState<object | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [chats, setChats] = useState<RealChat[]>([]);
  const [messages, setMessages] = useState<RealMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    const user = api.getUser();
    if (token && user) setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    api.chats.list().then(res => {
      if (res.chats) setChats(res.chats);
    });
  }, [currentUser]);

  const loadMessages = useCallback(async (chatId: string) => {
    setMessagesLoading(true);
    const res = await api.messages.list(chatId);
    if (res.messages) setMessages(res.messages);
    setMessagesLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChat) loadMessages(selectedChat.id);
  }, [selectedChat, loadMessages]);

  const handleAuth = (user: object) => {
    setCurrentUser(user);
    api.chats.list().then(res => {
      if (res.chats) setChats(res.chats);
    });
  };

  const handleLogout = async () => {
    await api.auth.logout();
    api.clearToken();
    setCurrentUser(null);
    setChats([]);
    setSelectedChat(null);
    setMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;
    const res = await api.messages.send(selectedChat.id, text);
    if (res.id) {
      setMessages(prev => [...prev, res as RealMessage]);
      setChats(prev => prev.map(c =>
        c.id === selectedChat.id ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c
      ));
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await api.messages.react(messageId, emoji);
    await loadMessages(selectedChat!.id);
  };

  const handleSelectChat = (chat: RealChat) => {
    setSelectedChat(chat);
    setActiveTab('chats');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'chats') setSelectedChat(null);
  };

  if (!authChecked) return null;
  if (!currentUser) return <AuthScreen onAuth={handleAuth} />;

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  const renderMainContent = () => {
    if (activeTab === 'contacts') return <ContactsPanel />;
    if (activeTab === 'search') return <SearchPanel />;
    if (activeTab === 'profile') return <ProfilePanel user={currentUser} onLogout={handleLogout} />;
    if (selectedChat) {
      return (
        <ChatWindow
          chat={selectedChat}
          messages={messages}
          loading={messagesLoading}
          onSend={handleSendMessage}
          onReact={handleReact}
        />
      );
    }
    return <EmptyState />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} totalUnread={totalUnread} />
      {activeTab === 'chats' && (
        <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={handleSelectChat} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>
      <NotificationToast />
    </div>
  );
}
