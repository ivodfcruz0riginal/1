import React from 'react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <div className="relative bg-leather-900/95 border-2 border-gold/40 rounded-lg px-12 py-10 shadow-2xl text-center max-w-sm">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold/60" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold/60" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold/60" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold/60" />

        <div className="text-3xl mb-4 opacity-40">🐂</div>
        <h2 className="font-display text-3xl text-gold tracking-widest uppercase mb-2">{title}</h2>
        <p className="text-ivory/50 text-sm font-body leading-relaxed mb-6">{subtitle}</p>

        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <p className="text-ivory/35 text-xs font-body uppercase tracking-widest">Em preparação</p>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>
        <p className="text-ivory/25 text-xs font-body italic">
          O Maioral está a preparar esta área da herdade.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
