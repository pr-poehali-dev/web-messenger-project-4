import { useState } from 'react';
import { chats, Chat } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface ChatListProps {
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
  const [filter, setFilter] = useState<'all' | 'personal' | 'groups'>('all');
  const [search, setSearch] = useState('');

  const filtered = chats.filter(c => {
    const matchesFilter = filter === 'all' || (filter === 'groups' ? c.isGroup : !c.isGroup);
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full w-72 border-r border-border bg-background">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-xl gradient-text">Сообщения</h1>
          <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-neon-purple/20 hover:text-neon-purple transition-all">
            <Icon name="Plus" size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1 mt-3">
          {[{ id: 'all', label: 'Все' }, { id: 'personal', label: 'Личные' }, { id: 'groups', label: 'Группы' }].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'personal' | 'groups')}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-all font-medium ${
                filter === f.id
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all duration-200 text-left group animate-slide-left opacity-0 hover-glow ${
              selectedChat?.id === chat.id
                ? 'bg-neon-purple/10 border border-neon-purple/25'
                : 'hover:bg-secondary border border-transparent'
            }`}
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${chat.color}cc, ${chat.color}66)`, border: `1.5px solid ${chat.color}44` }}
              >
                {chat.avatar}
              </div>
              {chat.online && !chat.isGroup && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-neon-green rounded-full border-2 border-background" />
              )}
              {chat.isGroup && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-neon-cyan/80 rounded-full border-2 border-background flex items-center justify-center">
                  <Icon name="Users" size={8} className="text-background" />
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground truncate">{chat.name}</span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] bg-neon-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}