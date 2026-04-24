import { Bell } from 'lucide-react';

export default function Header({ title }) {
  return (
    <header className="sticky top-0 h-[60px] border-b border-border bg-bg-base/90 backdrop-blur-md z-40 flex items-center justify-between px-6">
      <h2 className="text-[22px] font-normal tracking-[-0.11px] text-text-primary font-display">{title}</h2>
      
      <div className="flex items-center gap-4">
        <button className="text-text-muted hover:text-accent transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border border-bg-base"></span>
        </button>
        <div className="w-[36px] h-[36px] rounded-full bg-bg-hover border border-border flex items-center justify-center text-text-primary font-medium text-sm font-display">
          SA
        </div>
      </div>
    </header>
  );
}
