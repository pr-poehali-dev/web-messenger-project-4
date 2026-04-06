import { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '@/data/mockData';
import Icon from '@/components/ui/icon';

interface ChatWindowProps {
  chat: Chat;
}

const REACTIONS = ['❤️', '🔥', '😂', '😮', '👍', '🎉'];

export default function ChatWindow({ chat }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [input, setInput] = useState('');
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(chat.messages);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.id, chat.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: 'sent',
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2500);
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions?.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...m,
          reactions: m.reactions?.map(r => r.emoji === emoji ? { ...r, count: r.mine ? r.count - 1 : r.count + 1, mine: !r.mine } : r).filter(r => r.count > 0)
        };
      }
      return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, mine: true }] };
    }));
    setReactionTarget(null);
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
          {chat.online && !chat.isGroup && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-sm">{chat.name}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.isGroup ? `${chat.members} участников • Онлайн` : chat.online ? 'В сети' : 'Не в сети'}
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
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} group animate-fade-in opacity-0`}
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'forwards' }}
          >
            <div className="relative max-w-[70%]">
              {/* Message */}
              <div
                className={`relative px-4 py-2.5 ${msg.isOwn ? 'msg-out text-white' : 'msg-in text-foreground'}`}
                onDoubleClick={() => setReactionTarget(msg.id)}
              >
                {/* File attachment */}
                {msg.file && (
                  <div className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${msg.isOwn ? 'bg-white/10' : 'bg-secondary'}`}>
                    <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                      <Icon name={msg.file.type === 'image' ? 'Image' : 'File'} size={16} className="text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{msg.file.name}</p>
                      <p className={`text-[10px] ${msg.isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.file.size}</p>
                    </div>
                    <Icon name="Download" size={14} className={msg.isOwn ? 'text-white/70' : 'text-muted-foreground'} />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${msg.isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>{msg.time}</span>
                  {msg.isOwn && (
                    <Icon
                      name={msg.status === 'read' ? 'CheckCheck' : 'Check'}
                      size={12}
                      className={msg.status === 'read' ? 'text-neon-cyan' : 'text-white/60'}
                    />
                  )}
                </div>
              </div>

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className={`flex gap-1 mt-1 flex-wrap ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  {msg.reactions.map(r => (
                    <button
                      key={r.emoji}
                      onClick={(e) => { e.stopPropagation(); addReaction(msg.id, r.emoji); }}
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

              {/* Reaction picker */}
              {reactionTarget === msg.id && (
                <div
                  className={`absolute ${msg.isOwn ? 'right-0' : 'left-0'} -top-12 z-50 glass-strong rounded-2xl px-3 py-2 flex gap-2 border border-border shadow-2xl animate-scale-in`}
                  onClick={e => e.stopPropagation()}
                >
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Hover reaction btn */}
              <button
                className={`absolute ${msg.isOwn ? '-left-8' : '-right-8'} top-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-neon-purple hover:border-neon-purple/30`}
                onClick={(e) => { e.stopPropagation(); setReactionTarget(reactionTarget === msg.id ? null : msg.id); }}
              >
                <Icon name="Smile" size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="msg-in px-4 py-3 flex items-center gap-1">
              <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full inline-block" />
            </div>
          </div>
        )}
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
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Написать сообщение..."
              className="w-full bg-secondary border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all placeholder:text-muted-foreground pr-10"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-purple transition-colors">
              <Icon name="Smile" size={18} />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-br from-neon-purple to-purple-600 text-white hover:scale-105 hover:shadow-lg glow-purple"
          >
            <Icon name="Send" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
