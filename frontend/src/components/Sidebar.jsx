import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Users, Package, ShoppingCart } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Conversations", path: "/conversations", icon: MessageSquare },
    { name: "Users", path: "/users", icon: Users },
    { name: "Products", path: "/products", icon: Package },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-[240px] bg-bg-surface border-r border-border h-screen fixed top-0 left-0 flex flex-col z-50">
      <div className="h-[60px] flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <h1 className="text-[20px] font-normal text-text-primary tracking-[-0.03em] font-display">
            Support<span className="text-accent">AI</span>
          </h1>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (location.pathname === '/' && link.path === '/dashboard');
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-pill transition-all text-[14px] font-normal font-display ${
                isActive
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:bg-bg-hover hover:text-accent"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <span className="text-[12px] text-text-muted">v1.0.0</span>
      </div>
    </div>
  );
}
