"use client";

import { useState } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import CohortAnalysis from "../CohortAnalysis";
import ProjectionTable from "@/app/components/ProjectionTable";

export default function Visualization() {
  // Definindo estado local para controlar a aba ativa: 'cohort' ou 'projecoes'
  const [activeTab, setActiveTab] = useState<'cohort' | 'projecoes'>('cohort');

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-8">Análise</h2>

      {/* Barra de abas para alternar entre Análise de Cohortes e Projeções */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-2 ${activeTab === 'cohort' ? 'border-b-2 border-green-500 text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cohort')}
        >
          Análise de Cohortes
        </button>
        <button
          className={`pb-2 ${activeTab === 'projecoes' ? 'border-b-2 border-green-500 text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('projecoes')}
        >
          Projeções
        </button>
      </div>

      {/* Renderização condicional baseada na aba ativa */}
      {activeTab === 'cohort' && (
        <div className="mt-6">
          <CohortAnalysis />
        </div>
      )}
      {activeTab === 'projecoes' && (
        <div className="mt-6">
          <ProjectionTable />
        </div>
      )}
    </div>
  );
} 