export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-mesh text-center px-8">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/10 flex items-center justify-center border border-neon-purple/20 animate-float">
          <span className="text-5xl">💬</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-neon-pink/20 flex items-center justify-center border border-neon-pink/30 animate-float" style={{ animationDelay: '0.5s' }}>
          <span className="text-lg">⚡</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30 animate-float" style={{ animationDelay: '1s' }}>
          <span className="text-lg">🚀</span>
        </div>
      </div>
      <h2 className="font-display font-bold text-2xl gradient-text mb-2">Pulse Messenger</h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        Выберите чат слева или начните новый разговор. Общайтесь с яркими эмоциями!
      </p>
      <div className="flex gap-2 mt-6">
        {['💬', '🔥', '❤️', '🎉', '✨'].map((emoji, i) => (
          <div
            key={emoji}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-lg hover:scale-110 transition-transform cursor-default animate-fade-in opacity-0"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
