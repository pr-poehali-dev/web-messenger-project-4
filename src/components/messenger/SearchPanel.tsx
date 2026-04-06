import { useState } from 'react';
import { chats, contacts } from '@/data/mockData';
import Icon from '@/components/ui/icon';

type ResultType = 'message' | 'contact' | 'chat';
interface Result {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  avatar: string;
  color: string;
  time?: string;
}

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | ResultType>('all');

  const results: Result[] = query.trim().length < 1 ? [] : [
    ...chats.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
      id: c.id, type: 'chat' as ResultType, title: c.name, subtitle: 'Чат', avatar: c.avatar, color: c.color, time: c.time
    })),
    ...contacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
      id: c.id, type: 'contact' as ResultType, title: c.name, subtitle: c.status, avatar: c.avatar, color: c.color
    })),
    ...chats.flatMap(c => c.messages
      .filter(m => m.text.toLowerCase().includes(query.toLowerCase()))
      .map(m => ({
        id: m.id, type: 'message' as ResultType, title: c.name, subtitle: m.text, avatar: c.avatar, color: c.color, time: m.time
      }))
    ),
  ];

  const filtered = activeFilter === 'all' ? results : results.filter(r => r.type === activeFilter);

  const filters = [
    { id: 'all', label: 'Всё', icon: 'Search' },
    { id: 'message', label: 'Сообщения', icon: 'MessageSquare' },
    { id: 'contact', label: 'Контакты', icon: 'User' },
    { id: 'chat', label: 'Чаты', icon: 'MessageCircle' },
  ];

  const typeIcon: Record<ResultType, string> = { message: 'MessageSquare', contact: 'User', chat: 'MessageCircle' };
  const typeBadge: Record<ResultType, string> = { message: 'text-neon-cyan bg-neon-cyan/10', contact: 'text-neon-green bg-neon-green/10', chat: 'text-neon-purple bg-neon-purple/10' };
  const typeLabel: Record<ResultType, string> = { message: 'Сообщение', contact: 'Контакт', chat: 'Чат' };

  return (
    <div className="flex flex-col h-full w-full bg-mesh">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border glass">
        <h1 className="font-display font-bold text-2xl gradient-text mb-4">Поиск</h1>

        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по сообщениям, чатам, контактам..."
            autoFocus
            className="w-full bg-secondary border border-border rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as 'all' | ResultType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeFilter === f.id
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={f.icon} size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {query.trim().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-neon-purple/10 flex items-center justify-center mb-4 animate-float">
              <Icon name="Search" size={36} className="text-neon-purple/50" />
            </div>
            <p className="text-muted-foreground font-medium">Начните вводить запрос</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Поиск по сообщениям, чатам и контактам</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-muted-foreground">Ничего не найдено</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground mb-3 px-1">{filtered.length} результатов для «{query}»</p>
            {filtered.map((r, i) => (
              <div
                key={r.id + i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all cursor-pointer group border border-transparent hover-glow animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${r.color}cc, ${r.color}66)` }}
                >
                  {r.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{r.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${typeBadge[r.type]}`}>
                      {typeLabel[r.type]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.subtitle}</p>
                </div>
                {r.time && <span className="text-[10px] text-muted-foreground flex-shrink-0">{r.time}</span>}
                <Icon name={typeIcon[r.type]} size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
