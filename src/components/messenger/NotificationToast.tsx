import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface Notification {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  color: string;
  time: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', sender: 'Алина Громова', avatar: 'АГ', text: 'Новое сообщение от тебя! 😍', color: '#a855f7', time: 'только что' },
  { id: '2', sender: 'Команда дизайна', avatar: '🎨', text: 'Дима: Макеты готовы к ревью!', color: '#00d4ff', time: 'только что' },
  { id: '3', sender: 'Стартап Rocket', avatar: '🚀', text: '🎉 Получили инвестиции!', color: '#4ade80', time: 'только что' },
];

export default function NotificationToast() {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_NOTIFICATIONS.forEach((n, i) => {
      timers.push(setTimeout(() => {
        setQueue(q => [...q, n]);
      }, 3000 + i * 6000));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!visible && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(q => q.slice(1));
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }
  }, [queue, visible]);

  if (!current || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-notification">
      <div className="glass-strong border border-border rounded-2xl p-4 flex items-center gap-3 shadow-2xl min-w-72 max-w-80">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${current.color}cc, ${current.color}66)`, border: `1.5px solid ${current.color}44` }}
        >
          {current.avatar}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">{current.sender}</p>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{current.time}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{current.text}</p>
        </div>
        {/* Close */}
        <button onClick={() => setVisible(false)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0">
          <Icon name="X" size={14} />
        </button>
      </div>
      {/* Neon accent */}
      <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${current.color}, transparent)` }} />
    </div>
  );
}
