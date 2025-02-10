"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import CohortAnalysis from "../CohortAnalysis";
import FinancialProjections from "../FinancialProjections";
import { useState } from "react";

export default function Visualization() {
  const [activeTab, setActiveTab] = useState<'cohort' | 'projections'>('cohort');
  const { cohortData, projections } = useAnalytics();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cohort')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'cohort'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Análise de Coortes
          </button>
          <button
            onClick={() => setActiveTab('projections')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'projections'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Projeções Financeiras
          </button>
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="mt-6">
        {activeTab === 'cohort' ? (
          <CohortAnalysis />
        ) : (
          <FinancialProjections />
        )}
      </div>
    </div>
  );
} 