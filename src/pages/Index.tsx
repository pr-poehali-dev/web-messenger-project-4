import { useState } from 'react';
import Sidebar from '@/components/messenger/Sidebar';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsPanel from '@/components/messenger/ContactsPanel';
import SearchPanel from '@/components/messenger/SearchPanel';
import ProfilePanel from '@/components/messenger/ProfilePanel';
import EmptyState from '@/components/messenger/EmptyState';
import NotificationToast from '@/components/messenger/NotificationToast';
import { Chat, chats } from '@/data/mockData';

export default function Index() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'chats') setSelectedChat(null);
  };

  const renderMainContent = () => {
    if (activeTab === 'contacts') return <ContactsPanel />;
    if (activeTab === 'search') return <SearchPanel />;
    if (activeTab === 'profile') return <ProfilePanel />;
    return selectedChat ? <ChatWindow chat={selectedChat} /> : <EmptyState />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar nav */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} totalUnread={totalUnread} />

      {/* Chat list (only in chats tab) */}
      {activeTab === 'chats' && (
        <ChatList
          selectedChat={selectedChat}
          onSelectChat={(chat) => { setSelectedChat(chat); setActiveTab('chats'); }}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>

      {/* Notifications */}
      <NotificationToast />
    </div>
  );
}
