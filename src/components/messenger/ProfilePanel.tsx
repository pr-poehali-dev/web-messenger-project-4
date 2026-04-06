import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface UserData {
  display_name?: string;
  username?: string;
  avatar_initials?: string;
  avatar_color?: string;
  status?: string;
  [key: string]: unknown;
}

const THEMES = [
  { id: 'purple', label: 'Пульс', from: '#a855f7', to: '#00d4ff' },
  { id: 'pink', label: 'Закат', from: '#f472b6', to: '#fb923c' },
  { id: 'green', label: 'Неон', from: '#4ade80', to: '#00d4ff' },
  { id: 'gold', label: 'Золото', from: '#f59e0b', to: '#f472b6' },
];

const STATUSES = ['В сети', 'Не беспокоить', 'Недоступен', 'Невидимка'];

interface ProfilePanelProps {
  user: object;
  onLogout: () => void;
}

export default function ProfilePanel({ user, onLogout }: ProfilePanelProps) {
  const u = user as UserData;
  const [name, setName] = useState(u.display_name || '');
  const [status, setStatus] = useState(u.status || 'В сети');
  const [theme, setTheme] = useState('purple');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-mesh overflow-y-auto">
      {/* Hero */}
      <div className="relative px-6 pt-8 pb-6 border-b border-border">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 to-transparent" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-2xl glow-purple animate-float"
              style={{ background: `linear-gradient(135deg, #a855f7, #00d4ff)` }}
            >
              {u.avatar_initials || '??'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-neon-purple/20 hover:border-neon-purple/40 transition-all">
              <Icon name="Camera" size={14} className="text-muted-foreground" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-background" />
          </div>

          <h1 className="font-display font-black text-2xl gradient-text">{u.display_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">@{u.username}</p>

          {/* Status selector */}
          <div className="flex gap-2 mt-3 flex-wrap justify-center">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  status === s
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Info */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Личные данные</h2>
          <div className="space-y-3">
            {[
              { label: 'Имя', value: name, icon: 'User', editable: true },
              { label: 'Логин', value: `@${u.username || ''}`, icon: 'AtSign', editable: false },
              { label: 'Статус', value: status, icon: 'Activity', editable: false },
            ].map(field => (
              <div key={field.label} className="flex items-center gap-3 p-3.5 bg-card rounded-2xl border border-border hover-glow transition-all">
                <div className="w-9 h-9 rounded-xl bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={field.icon} size={16} className="text-neon-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">{field.label}</p>
                  {field.editable ? (
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none text-foreground"
                    />
                  ) : (
                    <p className="text-sm">{field.value}</p>
                  )}
                </div>
                {field.editable && <Icon name="Pencil" size={14} className="text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Тема оформления</h2>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  theme === t.id ? 'bg-neon-purple/10 border border-neon-purple/30' : 'bg-card border border-border hover:border-border/60'
                }`}
              >
                <div className="w-8 h-8 rounded-xl" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
                <span className="text-[10px] text-muted-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Настройки</h2>
          <div className="space-y-2">
            {[
              { label: 'Уведомления', icon: 'Bell', value: notifications, setter: setNotifications, color: 'neon-purple' },
              { label: 'Звуки', icon: 'Volume2', value: sounds, setter: setSounds, color: 'neon-cyan' },
              { label: 'Приватность', icon: 'Shield', value: privacy, setter: setPrivacy, color: 'neon-green' },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between p-3.5 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon name={setting.icon} size={16} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">{setting.label}</span>
                </div>
                <button
                  onClick={() => setting.setter(!setting.value)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    setting.value ? 'bg-neon-purple' : 'bg-secondary border border-border'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${setting.value ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
              : 'bg-gradient-to-r from-neon-purple to-purple-600 text-white hover:scale-[1.01] glow-purple'
          }`}
        >
          {saved ? '✓ Сохранено' : 'Сохранить изменения'}
        </button>

        <button onClick={onLogout} className="w-full py-3 rounded-2xl text-sm text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all font-medium">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}