import React, { useState } from 'react';
import { useGameState } from '../store/gameState';
import { formatEuro } from '../store/economyEngine';

const ContractOfferModal: React.FC = () => {
  const { state, respondContract } = useGameState();
  const [negotiating, setNegotiating] = useState(false);

  const offer = state.pendingContract;
  if (!offer) return null;

  const handleNegotiate = () => {
    setNegotiating(true);
    setTimeout(() => {
      respondContract('negotiate');
      setNegotiating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-leather-900 border-2 border-gold/40 rounded-lg shadow-2xl w-full max-w-lg">

        {/* Corner ornaments */}
        <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-gold/70" />
        <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-gold/70" />
        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-gold/70" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-gold/70" />

        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-leather-700/50">
          <p className="text-ivory/35 text-[10px] font-body uppercase tracking-[0.22em] mb-1">Correspondência</p>
          <h2 className="font-display text-xl text-gold tracking-widest uppercase">Proposta de Contrato</h2>
          <p className="text-ivory/40 text-xs font-body mt-1">{offer.placeName} · {offer.city}</p>
        </div>

        {/* Letter body */}
        <div className="px-7 py-5">
          <div className="bg-leather-800/30 border border-leather-600/30 rounded-lg p-5 mb-5">
            <p className="text-ivory/75 text-[13px] font-body leading-relaxed whitespace-pre-line">
              {offer.letterText}
            </p>
          </div>

          {/* Offer summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-leather-800/40 border border-leather-600/30 rounded-lg p-3 text-center">
              <p className="text-ivory/35 text-[9px] font-body uppercase tracking-wider mb-1">Praça</p>
              <p className="font-display text-sm text-ivory">{offer.city}</p>
            </div>
            <div className="bg-leather-800/40 border border-leather-600/30 rounded-lg p-3 text-center">
              <p className="text-ivory/35 text-[9px] font-body uppercase tracking-wider mb-1">Corrida</p>
              <p className="font-display text-sm text-ivory">{offer.performanceMonth}</p>
              <p className="text-ivory/35 text-[10px] font-body">{offer.performanceYear}</p>
            </div>
            <div className="bg-gold/8 border border-gold/25 rounded-lg p-3 text-center">
              <p className="text-ivory/35 text-[9px] font-body uppercase tracking-wider mb-1">Valor</p>
              <p className="font-display text-sm text-gold">{formatEuro(offer.basePayment)}</p>
              <p className="text-ivory/30 text-[10px] font-body">{offer.bullsRequired} toiros</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => respondContract('accept')}
              className="flex-1 py-2.5 bg-emerald-900/40 border-2 border-emerald-500/40 hover:border-emerald-400/70 hover:bg-emerald-900/60 rounded-lg font-display text-sm text-emerald-400 tracking-wider uppercase transition-all duration-200"
            >
              Aceitar
            </button>
            <button
              onClick={handleNegotiate}
              disabled={negotiating}
              className={`flex-1 py-2.5 border-2 rounded-lg font-display text-sm tracking-wider uppercase transition-all duration-200 ${
                negotiating
                  ? 'bg-amber-900/20 border-amber-500/20 text-amber-400/40 cursor-not-allowed'
                  : 'bg-amber-900/30 border-amber-500/35 hover:border-amber-400/60 hover:bg-amber-900/50 text-amber-400'
              }`}
            >
              {negotiating ? 'A negociar...' : 'Negociar'}
            </button>
            <button
              onClick={() => respondContract('decline')}
              className="flex-1 py-2.5 bg-leather-800/40 border-2 border-leather-500/30 hover:border-red-500/40 hover:bg-red-900/15 hover:text-red-400 rounded-lg font-display text-sm text-ivory/50 tracking-wider uppercase transition-all duration-200"
            >
              Recusar
            </button>
          </div>

          <p className="text-ivory/20 text-[10px] font-body text-center mt-3">
            Aceitar reserva um adiantamento de 30% · Negociar pode aumentar ou manter o valor
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractOfferModal;
