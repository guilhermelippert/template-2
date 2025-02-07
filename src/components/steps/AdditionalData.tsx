"use client";

import { useState, useEffect } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { FinancialMetrics } from "@/lib/types/cohort";

export default function AdditionalData() {
  const { 
    financialMetrics, 
    updateFinancialMetrics, 
    setCurrentStep, 
    canProceedToNext,
    rawData,
    columnMapping 
  } = useAnalytics();

  useEffect(() => {
    console.log("AdditionalData - Estado inicial:", {
      rawData: rawData.length,
      columnMapping,
      financialMetrics
    });
  }, []);

  const [formData, setFormData] = useState<FinancialMetrics>(financialMetrics);

  const handleInputChange = (field: keyof FinancialMetrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    console.log(`AdditionalData - Atualizando ${field}:`, numValue);
    const newData = { ...formData, [field]: numValue };
    setFormData(newData);
    updateFinancialMetrics({ [field]: numValue });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Dados Adicionais</h2>
        
        <div className="space-y-6">
          {/* CAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CAC (Custo de Aquisição de Cliente)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">R$</span>
              <input
                type="number"
                value={formData.cac || ''}
                onChange={(e) => handleInputChange('cac', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* CPV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPV (Custo por Visualização)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">R$</span>
              <input
                type="number"
                value={formData.cpv || ''}
                onChange={(e) => handleInputChange('cpv', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Margem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margem de Contribuição (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.margin * 100 || ''}
                onChange={(e) => handleInputChange('margin', (parseFloat(e.target.value) / 100).toString())}
                className="w-full pr-8 py-2 border rounded-md"
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="absolute right-3 top-2">%</span>
            </div>
          </div>

          {/* Investimentos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investimento em Aquisição
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2">R$</span>
                <input
                  type="number"
                  value={formData.acquisitionInvestment || ''}
                  onChange={(e) => handleInputChange('acquisitionInvestment', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-md"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investimento em Monetização
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2">R$</span>
                <input
                  type="number"
                  value={formData.monetizationInvestment || ''}
                  onChange={(e) => handleInputChange('monetizationInvestment', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-md"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Botões de Navegação */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep('mapping')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
            
            <button
              onClick={() => setCurrentStep('visualization')}
              disabled={!canProceedToNext}
              className={`px-4 py-2 rounded-md text-white
                ${canProceedToNext
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              Visualizar Resultados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 