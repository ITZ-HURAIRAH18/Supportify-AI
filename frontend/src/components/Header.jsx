import { Bell } from 'lucide-react';

export default function Header({ title }) {
  return (
    <header className="sticky top-0 h-[60px] border-b border-[#1F1F1F] bg-bg-base/90 backdrop-blur-md z-40 flex items-center justify-between px-6">
      <h2 className="text-[20px] font-semibold text-text-primary">{title}</h2>
      
      <div className="flex items-center gap-4">
        <button className="text-text-muted hover:text-text-primary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border border-bg-base"></span>
        </button>
        <div className="w-[36px] h-[36px] rounded-full bg-accent-muted-bg border border-accent/20 flex items-center justify-center text-accent-muted-text font-medium text-sm">
          SA
        </div>
      </div>
    </header>
  );
}
