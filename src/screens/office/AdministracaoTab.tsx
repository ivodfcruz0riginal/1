import React from 'react';
import { SectionTitle, EmptyState } from './OfficePrimitives';

const AdministracaoTab: React.FC = () => (
  <div className="h-full flex flex-col overflow-hidden">
    <SectionTitle>Equipa da Ganadaria</SectionTitle>
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon="👨‍🌾"
        title="A equipa está no campo"
        subtitle="O Maioral, os campinos e o veterinário. A gestão da equipa estará disponível em breve."
      />
    </div>
  </div>
);

export default AdministracaoTab;
