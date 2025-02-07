"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import DataUpload from "./steps/DataUpload";
import ColumnMapping from "./steps/ColumnMapping";
import GrowthPlan from "./steps/GrowthPlan";
import Visualization from "./steps/Visualization";
import { AnalysisStep } from "@/lib/types/cohort";

export default function StepManager() {
  const { currentStep } = useAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Indicador de Progresso */}
        <Steps currentStep={currentStep} />
        
        {/* Conteúdo da Etapa */}
        <div className="mt-8">
          {currentStep === 'upload' && <DataUpload />}
          {currentStep === 'mapping' && <ColumnMapping />}
          {currentStep === 'additional' && <GrowthPlan />}
          {currentStep === 'visualization' && <Visualization />}
        </div>
      </div>
    </div>
  );
}

// Componente de indicador de progresso
function Steps({ currentStep }: { currentStep: AnalysisStep }) {
  const { setCurrentStep, rawData, columnMapping, financialMetrics } = useAnalytics();

  // Função para verificar se uma etapa está disponível para navegação
  const canNavigateToStep = (stepId: AnalysisStep): boolean => {
    switch (stepId) {
      case 'upload':
        return true; // Sempre pode voltar para o upload
      case 'mapping':
        return rawData.length > 0; // Só pode ir para mapping se tiver dados
      case 'additional':
        return rawData.length > 0 && columnMapping !== null; // Precisa ter dados e mapeamento
      case 'visualization':
        return rawData.length > 0 && columnMapping !== null && 
          financialMetrics.cac > 0 && financialMetrics.margin > 0; // Todas as etapas anteriores completas
      default:
        return false;
    }
  };

  const steps = [
    { id: 'upload' as AnalysisStep, title: 'Upload de Dados' },
    { id: 'mapping' as AnalysisStep, title: 'Mapeamento' },
    { id: 'additional' as AnalysisStep, title: 'Plano de Growth' },
    { id: 'visualization' as AnalysisStep, title: 'Projeções' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => {
        const isAvailable = canNavigateToStep(step.id);
        const isCurrent = currentStep === step.id;
        const isCompleted = steps.indexOf({ id: currentStep, title: '' }) > index;

        return (
          <div key={step.id} className="flex items-center">
            {/* Linha conectora */}
            {index > 0 && (
              <div className={`w-10 h-0.5 -ml-2 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            
            {/* Círculo e título */}
            <button
              onClick={() => isAvailable && setCurrentStep(step.id)}
              disabled={!isAvailable}
              className={`flex flex-col items-center ${
                isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isCurrent ? 'bg-green-500 text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  isAvailable ? 'bg-white border-2 border-green-500 text-green-500' :
                  'bg-gray-200 text-gray-400'}
              `}>
                {index + 1}
              </div>
              <span className={`mt-2 text-sm ${
                isCurrent ? 'text-green-600 font-medium' :
                isAvailable ? 'text-gray-600' :
                'text-gray-400'
              }`}>
                {step.title}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
} 