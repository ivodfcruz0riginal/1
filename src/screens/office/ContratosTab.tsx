import React from 'react';
import { SectionTitle, EmptyState } from './OfficePrimitives';

const ContratosTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-hidden">
    <SectionTitle>Acordos e Contratos</SectionTitle>
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon="🤝"
        title="Nenhum acordo celebrado"
        subtitle="Quando fechar negócio com praças, ganadeiros ou agentes, os contratos ficarão aqui registados."
      />
    </div>
  </div>
);

export default ContratosTab;
