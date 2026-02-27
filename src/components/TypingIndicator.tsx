const TypingIndicator = () => {
  return (
    <div className="flex items-start mb-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
