"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import CohortAnalysis from "../CohortAnalysis";

export default function Visualization() {
  // Usamos apenas a análise de coortes, não há necessidade de estado para abas
  const { cohortData } = useAnalytics();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título único para Análise de Coortes */}
      <h2 className="text-xl font-bold mb-8">Análise de Coortes</h2>

      {/* Conteúdo */}
      <div className="mt-6">
        <CohortAnalysis />
      </div>
    </div>
  );
} 