import { useState } from 'react';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface AuthScreenProps {
  onAuth: (user: object) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await api.auth.login(username.trim(), password);
      } else {
        res = await api.auth.register(username.trim(), displayName.trim(), password);
      }
      if (res.error) {
        setError(res.error);
      } else {
        api.setToken(res.token);
        api.setUser(res.user);
        onAuth(res.user);
      }
    } catch {
      setError('Ошибка подключения. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-mesh">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-cyan/8 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-sm px-4 animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center glow-purple mb-4 animate-float">
            <span className="text-white font-display font-black text-2xl">P</span>
          </div>
          <h1 className="font-display font-black text-3xl gradient-text">Pulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Мессенджер нового поколения</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 border border-border shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-secondary rounded-2xl p-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Имя пользователя</label>
              <div className="relative">
                <Icon name="AtSign" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  placeholder="username"
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Display name (register only) */}
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Отображаемое имя</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handle()}
                    placeholder="Иван Иванов"
                    className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 animate-fade-in">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handle}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-neon-purple to-purple-600 text-white font-semibold text-sm hover:scale-[1.01] transition-all glow-purple disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Вхожу...' : 'Регистрирую...'}
                </span>
              ) : (
                mode === 'login' ? 'Войти' : 'Создать аккаунт'
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Pulse Messenger © 2026
        </p>
      </div>
    </div>
  );
}
