import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, badge }) => (
  <div className={`relative group ${active ? 'sidebar-item-active' : 'sidebar-item'}`}>
    {/* Active indicator bar */}
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-r"></div>}

    <span className="text-lg relative z-10">{icon}</span>
    <span className="flex-1 font-body text-sm tracking-wide relative z-10">{label}</span>
    {badge !== undefined && (
      <span className="bg-gold/25 text-gold text-[10px] px-2 py-0.5 rounded-full font-semibold border border-gold/30">
        {badge}
      </span>
    )}

    {/* Hover glow effect */}
    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none"></div>
  </div>
);

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: '🏘️', label: 'Herdade', active: true },
    { icon: '🐂', label: 'Efetivo', badge: 42 },
    { icon: '❤️', label: 'Reprodução' },
    { icon: '🎯', label: 'Tentas' },
    { icon: '🏇', label: 'Corridas' },
    { icon: '📰', label: 'Jornal', badge: 3 },
    { icon: '📖', label: 'Livro da Casa' },
    { icon: '💰', label: 'Economia' },
    { icon: '⚙️', label: 'Definições' },
  ];

  return (
    <aside className="w-60 bg-leather-900 border-r-2 border-gold/20 flex flex-col h-screen">
      {/* Logo Area */}
      <div className="p-5 border-b-2 border-gold/20">
        <div className="flex items-center justify-center">
          <div className="text-center relative">
            {/* Decorative frame */}
            <div className="absolute -inset-3 border border-gold/20 rounded-lg pointer-events-none"></div>
            <div className="absolute -top-2 -left-2 w-2 h-2 border-t border-l border-gold/40"></div>
            <div className="absolute -top-2 -right-2 w-2 h-2 border-t border-r border-gold/40"></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 border-b border-l border-gold/40"></div>
            <div className="absolute -bottom-2 -right-2 w-2 h-2 border-b border-r border-gold/40"></div>

            <h1 className="font-display text-2xl text-gold tracking-[0.2em]">HERANÇA</h1>
            <h2 className="font-display text-xl text-gold-light tracking-[0.15em]">BRAVA</h2>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/60"></div>
              <div className="w-1.5 h-1.5 bg-gold/40 rotate-45"></div>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto px-2">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={item.active}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Footer decoration */}
      <div className="p-4 border-t-2 border-gold/20 bg-leather-900/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-px bg-gold/30"></div>
            <span className="text-gold/40 text-xs">✦</span>
            <div className="w-6 h-px bg-gold/30"></div>
          </div>
          <p className="text-ivory/30 text-xs font-body tracking-wider">PROVÍNCIA DO ALENTEJO</p>
          <p className="text-ivory/20 text-[10px] font-body mt-0.5">Est. 1947</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
