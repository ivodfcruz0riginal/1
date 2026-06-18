import React from 'react';
import { SectionTitle, EmptyState } from './OfficePrimitives';

const AdministracaoTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-hidden">
    <SectionTitle>Administração</SectionTitle>
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon="⚙️"
        title="Administração"
        subtitle="Gestão de pessoal, instalações e configurações do jogo. Disponível em breve."
      />
    </div>
  </div>
);

export default AdministracaoTab;
