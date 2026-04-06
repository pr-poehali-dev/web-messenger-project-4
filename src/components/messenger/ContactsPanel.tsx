import { useState } from 'react';
import { contacts } from '@/data/mockData';
import Icon from '@/components/ui/icon';

export default function ContactsPanel() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState('');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, typeof contacts>>((acc, c) => {
    const letter = c.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full w-full bg-mesh">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border glass">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-2xl gradient-text">Контакты</h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neon-purple/20 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/30 transition-all text-sm font-medium"
          >
            <Icon name="UserPlus" size={16} />
            Добавить
          </button>
        </div>

        {/* Add contact */}
        {showAdd && (
          <div className="flex gap-2 mb-4 animate-fade-in">
            <input
              value={newContact}
              onChange={e => setNewContact(e.target.value)}
              placeholder="Имя пользователя или телефон"
              className="flex-1 bg-secondary border border-neon-purple/30 rounded-xl px-4 py-2 text-sm outline-none focus:border-neon-purple transition-all placeholder:text-muted-foreground"
            />
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-purple-600 text-white text-sm font-medium hover:scale-105 transition-transform">
              Найти
            </button>
          </div>
        )}

        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск контактов..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-neon-purple/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Online bar */}
      <div className="px-6 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2 font-medium">В СЕТИ</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {contacts.filter(c => c.online).map(c => (
            <div key={c.id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${c.color}cc, ${c.color}66)`, border: `1.5px solid ${c.color}44` }}
                >
                  {c.avatar}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-neon-green rounded-full border-2 border-background" />
              </div>
              <span className="text-[10px] text-muted-foreground w-12 truncate text-center">{c.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {Object.entries(groups).sort().map(([letter, group]) => (
          <div key={letter}>
            <div className="flex items-center gap-2 mb-2 mt-3">
              <span className="text-xs font-bold text-neon-purple">{letter}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {group.map((contact, i) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all cursor-pointer group mb-1 border border-transparent hover-glow animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
              >
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${contact.color}cc, ${contact.color}66)` }}
                  >
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${contact.online ? 'bg-neon-green' : 'bg-muted-foreground'}`} />
                    {contact.status}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 transition-all">
                    <Icon name="MessageCircle" size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all">
                    <Icon name="Phone" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
