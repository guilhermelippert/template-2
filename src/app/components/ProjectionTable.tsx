"use client";

import React, { useState, useEffect } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { generateGrowthProjections } from "@/lib/services/growthProjectionService";
import { SaleData } from "@/lib/types/growthProjection";
import { formatCurrency } from "@/lib/utils/format";
import { CohortData } from "@/lib/types/cohort";

export default function ProjectionTable() {
  const { rawData, financialMetrics, cohortData, updateFinancialMetrics } = useAnalytics();

  // Estado local para os parâmetros editáveis
  const [params, setParams] = useState({
    monthlyInvestment: financialMetrics.monthlyInvestment,
    cac: financialMetrics.cac,
    cpv: financialMetrics.cpv,
    margin: financialMetrics.margin,
  });

  // Estado para as projeções
  const [projections, setProjections] = useState<any[]>([]);
  const [retentionRates, setRetentionRates] = useState<number[]>([]);

  // Novo estado para o multiplicador de retenção
  const [retentionMultiplier, setRetentionMultiplier] = useState(1); // 1 = 100% da taxa atual

  // Função para atualizar um parâmetro específico
  const handleParamChange = (param: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setParams(prev => ({ ...prev, [param]: numValue }));
  };

  // Efeito para recalcular projeções quando os parâmetros mudam
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;

    const sales: SaleData[] = rawData.map((item: any) => ({
      id: item.cpf || item.id || item.customer_id,
      saleDate: item.data_compra || item.date || item.purchase_date,
      saleValue: Number(item.valor_compra || item.value || item.purchase_value),
    }));

    const growthParams = {
      ...params,
      projectionMonths: 12,
    };

    if (cohortData) {
      // Extrair taxas base de retenção
      const baseRates = extractRetentionRates(cohortData);
      // Aplicar multiplicador
      const adjustedRates = baseRates.map(rate => rate * retentionMultiplier);
      setRetentionRates(adjustedRates);
      
      // Gerar projeções com taxas ajustadas
      const newProjections = generateGrowthProjections(sales, growthParams, cohortData, adjustedRates);
      setProjections(newProjections);
    }
  }, [params, rawData, cohortData, retentionMultiplier]);

  // Verificações de dados
  if (!rawData || rawData.length === 0) {
    return <div className="p-4 text-red-500">Nenhum dado disponível para projeções.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Parâmetros Utilizados</h3>
        
        {/* Parâmetros Financeiros Editáveis */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Parâmetros Financeiros</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500">CAC:</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={params.cac}
                  onChange={(e) => handleParamChange('cac', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500">Investimento Mensal:</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={params.monthlyInvestment}
                  onChange={(e) => handleParamChange('monthlyInvestment', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500">CPV:</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={params.cpv}
                  onChange={(e) => handleParamChange('cpv', e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500">Margem (%):</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={params.margin * 100}
                  onChange={(e) => handleParamChange('margin', (Number(e.target.value) / 100).toString())}
                  min="0"
                  max="100"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pr-4 sm:text-sm border-gray-300 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taxas de Retenção com Ajuste */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ajuste de Retenção</h4>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={retentionMultiplier}
                onChange={(e) => setRetentionMultiplier(Number(e.target.value))}
                className="w-64"
              />
              <span className="text-sm text-gray-600">
                {(retentionMultiplier * 100).toFixed(0)}% da taxa atual
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ajuste o multiplicador para simular cenários de retenção (50% a 200% da taxa atual)
            </p>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mb-2">Taxas de Retenção Ajustadas</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {retentionRates.map((rate, index) => (
              <div key={index} className="relative">
                <span className="text-sm text-gray-500">Mês {index + 1}:</span>
                <p className={`font-medium ${rate > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {rate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">
                  Base: {(rate / retentionMultiplier).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Taxas base calculadas com média histórica, ajustadas pelo multiplicador
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Novos</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Retidos</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROI (%)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projections.map((proj, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{proj.month}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{proj.newCustomers}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{proj.retainedCustomers}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{proj.totalCustomers}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(proj.revenue)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(proj.totalCost)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  <span className={proj.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(proj.profit)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  <span className={proj.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {proj.roi.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(proj.customerLifetimeValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Função auxiliar para extrair taxas de retenção
function extractRetentionRates(cohortData: CohortData[]): number[] {
  // Usar todos os meses disponíveis
  const averageRates: number[] = [];
  
  // Para cada período (M1 até M12)
  for (let i = 1; i <= 12; i++) {
    const monthKey = `M${i}`;
    const rates = cohortData
      .map(cohort => cohort.retentionRates[monthKey])
      .filter(rate => rate !== undefined);
    
    if (rates.length > 0) {
      // Não dividimos por 100 pois os valores já estão em decimal
      const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      averageRates.push(avgRate);
    }
  }

  console.log('Extracted Retention Rates:', averageRates); // Debug
  return averageRates;
} 