import React from 'react';
import { SectionTitle, EmptyState } from './OfficePrimitives';

const ContratosTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-hidden">
    <SectionTitle>Contratos Activos</SectionTitle>
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon="📜"
        title="Sem contratos activos"
        subtitle="Os contratos aparecerão aqui quando forem celebrados."
      />
    </div>
  </div>
);

export default ContratosTab;
