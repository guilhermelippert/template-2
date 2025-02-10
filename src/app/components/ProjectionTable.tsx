"use client";

import React from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { generateGrowthProjections } from "@/lib/services/growthProjectionService";
import { SaleData } from "@/lib/types/growthProjection";
import { formatCurrency } from "@/lib/utils/format";

export default function ProjectionTable() {
  const { rawData, financialMetrics, cohortData } = useAnalytics();

  // Debug: Vamos ver o que estamos recebendo
  console.log('Raw Data:', rawData);
  console.log('Financial Metrics:', financialMetrics);
  console.log('Cohort Data:', cohortData);

  // Verificações de dados
  if (!rawData || rawData.length === 0) {
    return <div className="p-4 text-red-500">Nenhum dado disponível para projeções.</div>;
  }

  if (!financialMetrics || !financialMetrics.cac || !financialMetrics.monthlyInvestment || !financialMetrics.cpv || !financialMetrics.margin) {
    return (
      <div className="p-4 text-red-500">
        Parâmetros financeiros insuficientes. Certifique-se de preencher:
        <ul className="list-disc ml-4 mt-2">
          <li>CAC (Custo de Aquisição de Cliente)</li>
          <li>Investimento Mensal</li>
          <li>CPV (Custo por Venda)</li>
          <li>Margem de Contribuição</li>
        </ul>
      </div>
    );
  }

  // Converter os dados brutos para o formato SaleData
  const sales: SaleData[] = rawData.map((item: any) => ({
    id: item.cpf || item.id || item.customer_id, // Tentar diferentes campos possíveis
    saleDate: item.data_compra || item.date || item.purchase_date,
    saleValue: Number(item.valor_compra || item.value || item.purchase_value),
  }));

  // Debug: Vamos ver os dados convertidos
  console.log('Converted Sales Data:', sales);

  // Montar os parâmetros para a projeção de crescimento
  const growthParams = {
    monthlyInvestment: Number(financialMetrics.monthlyInvestment),
    cac: Number(financialMetrics.cac),
    cpv: Number(financialMetrics.cpv),
    margin: Number(financialMetrics.margin),
    projectionMonths: 12,
  };

  // Debug: Vamos ver os parâmetros
  console.log('Growth Params:', growthParams);

  // Gerar as projeções passando cohortData
  const projections = generateGrowthProjections(sales, growthParams, cohortData);

  // Debug: Vamos ver as projeções geradas
  console.log('Generated Projections:', projections);

  // Extrair taxas de retenção do cohortData
  const retentionRates = cohortData ? extractRetentionRates(cohortData) : [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Parâmetros Utilizados</h3>
        
        {/* Parâmetros Financeiros */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Parâmetros Financeiros</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">CAC:</span>
              <p className="font-medium">{formatCurrency(growthParams.cac)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Investimento Mensal:</span>
              <p className="font-medium">{formatCurrency(growthParams.monthlyInvestment)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">CPV:</span>
              <p className="font-medium">{formatCurrency(growthParams.cpv)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Margem:</span>
              <p className="font-medium">{(growthParams.margin * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Taxas de Retenção */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Taxas de Retenção Históricas</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {retentionRates.map((rate, index) => (
              <div key={index}>
                <span className="text-sm text-gray-500">Mês {index + 1}:</span>
                <p className={`font-medium ${rate > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {rate.toFixed(1)}%
                </p>
              </div>
            ))}
            {retentionRates.length === 0 && (
              <div className="col-span-full text-yellow-600">
                Nenhuma taxa de retenção histórica disponível
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Taxas calculadas com base na média de todos os períodos históricos
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