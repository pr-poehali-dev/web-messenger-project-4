import { useState, useRef, useEffect } from 'react';
import { RealChat, RealMessage } from '@/pages/Index';
import Icon from '@/components/ui/icon';

interface ChatWindowProps {
  chat: RealChat;
  messages: RealMessage[];
  loading: boolean;
  onSend: (text: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
}

const REACTIONS = ['❤️', '🔥', '😂', '😮', '👍', '🎉'];

export default function ChatWindow({ chat, messages, loading, onSend, onReact }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await onSend(input.trim());
    setInput('');
    setSending(false);
  };

  const handleReact = async (msgId: string, emoji: string) => {
    setReactionTarget(null);
    await onReact(msgId, emoji);
  };

  return (
    <div className="flex flex-col h-full flex-1 bg-mesh">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border glass">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${chat.color}cc, ${chat.color}66)`, border: `1.5px solid ${chat.color}44` }}
          >
            {chat.avatar}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-sm">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.is_group ? `${chat.members_count} участников` : 'Личный чат'}
          </p>
        </div>
        <div className="flex gap-1">
          {[{ icon: 'Phone', label: 'Звонок' }, { icon: 'Video', label: 'Видео' }, { icon: 'MoreVertical', label: 'Ещё' }].map(btn => (
            <button key={btn.icon} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 transition-all" title={btn.label}>
              <Icon name={btn.icon} size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" onClick={() => setReactionTarget(null)}>
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex gap-1">
              <span className="typing-dot w-2 h-2 bg-neon-purple rounded-full" />
              <span className="typing-dot w-2 h-2 bg-neon-purple rounded-full" />
              <span className="typing-dot w-2 h-2 bg-neon-purple rounded-full" />
            </div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-3">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-muted-foreground text-sm">Нет сообщений</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Напишите первое сообщение!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'} group animate-fade-in opacity-0`}
            style={{ animationDelay: `${Math.min(i, 15) * 30}ms`, animationFillMode: 'forwards' }}
          >
            {!msg.is_own && chat.is_group && (
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white mr-1.5 flex-shrink-0 self-end mb-1"
                style={{ background: `linear-gradient(135deg, ${msg.sender.avatar_color}cc, ${msg.sender.avatar_color}66)` }}
              >
                {msg.sender.avatar_initials}
              </div>
            )}

            <div className="relative max-w-[70%]">
              {!msg.is_own && chat.is_group && (
                <p className="text-[10px] font-medium mb-0.5 ml-1" style={{ color: msg.sender.avatar_color }}>
                  {msg.sender.display_name}
                </p>
              )}

              <div
                className={`relative px-4 py-2.5 ${msg.is_own ? 'msg-out text-white' : 'msg-in text-foreground'}`}
                onDoubleClick={() => setReactionTarget(msg.id)}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.is_own ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${msg.is_own ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</span>
                  {msg.is_own && <Icon name="CheckCheck" size={12} className="text-neon-cyan" />}
                </div>
              </div>

              {msg.reactions && msg.reactions.length > 0 && (
                <div className={`flex gap-1 mt-1 flex-wrap ${msg.is_own ? 'justify-end' : 'justify-start'}`}>
                  {msg.reactions.map(r => (
                    <button
                      key={r.emoji}
                      onClick={(e) => { e.stopPropagation(); handleReact(msg.id, r.emoji); }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all animate-emoji-pop hover:scale-110 ${
                        r.mine ? 'bg-neon-purple/20 border border-neon-purple/40 text-neon-purple' : 'bg-secondary border border-border text-foreground'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="font-medium">{r.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {reactionTarget === msg.id && (
                <div
                  className={`absolute ${msg.is_own ? 'right-0' : 'left-0'} -top-12 z-50 glass-strong rounded-2xl px-3 py-2 flex gap-2 border border-border shadow-2xl animate-scale-in`}
                  onClick={e => e.stopPropagation()}
                >
                  {REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className="text-xl hover:scale-125 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <button
                className={`absolute ${msg.is_own ? '-left-8' : '-right-8'} top-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-neon-purple hover:border-neon-purple/30`}
                onClick={(e) => { e.stopPropagation(); setReactionTarget(reactionTarget === msg.id ? null : msg.id); }}
              >
                <Icon name="Smile" size={14} />
              </button>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border glass">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 transition-all flex-shrink-0">
            <Icon name="Paperclip" size={18} />
          </button>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Написать сообщение..."
              className="w-full bg-secondary border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground pr-10"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-purple transition-colors">
              <Icon name="Smile" size={18} />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-br from-neon-purple to-purple-600 text-white hover:scale-105 hover:shadow-lg glow-purple"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="Send" size={17} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
