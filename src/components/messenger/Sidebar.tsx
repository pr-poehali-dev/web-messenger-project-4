import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { currentUser } from '@/data/mockData';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  totalUnread: number;
}

const navItems = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'search', icon: 'Search', label: 'Поиск' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
];

export default function Sidebar({ activeTab, onTabChange, totalUnread }: SidebarProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 px-2 glass border-r border-border w-16 h-full">
      {/* Logo */}
      <div className="mb-2 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center glow-purple animate-float">
          <span className="text-white font-display font-black text-sm">P</span>
        </div>
      </div>

      <div className="w-8 h-px bg-border mb-1" />

      {/* Nav */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group ${
              activeTab === item.id
                ? 'nav-active glow-purple'
                : 'hover:bg-secondary hover:scale-105'
            }`}
            title={item.label}
          >
            <Icon
              name={item.icon}
              size={20}
              className={activeTab === item.id ? 'text-neon-purple' : 'text-muted-foreground group-hover:text-foreground'}
            />
            {item.id === 'chats' && totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
            {/* Tooltip */}
            <span className="absolute left-14 bg-card border border-border text-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Avatar */}
      <button
        onClick={() => onTabChange('profile')}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white hover:scale-105 transition-transform relative"
        style={{ background: `linear-gradient(135deg, ${currentUser.color}, #00d4ff)` }}
      >
        {currentUser.avatar}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
      </button>
    </div>
  );
}
