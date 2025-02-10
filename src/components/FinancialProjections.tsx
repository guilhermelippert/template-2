"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import FinancialMetricsChart from './charts/FinancialMetricsChart';
import ProjectionMetricsChart from './charts/ProjectionMetricsChart';
import CustomerMetricsChart from './charts/CustomerMetricsChart';
import { useProjections } from '@/lib/hooks/useProjections';
import { useState, useMemo } from 'react';
import { calculateAggregatedMetrics } from "@/lib/utils/projectionCalculations";

export default function FinancialProjections() {
  const { financialMetrics, projections } = useAnalytics();
  const { projections: projectionData, params, updateParams, error } = useProjections();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calcular métricas agregadas
  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = projections.reduce((sum, p) => sum + p.totalCost, 0);
  const averageROI = projections.reduce((sum, p) => sum + p.roi, 0) / projections.length;
  const totalCustomers = projections[projections.length - 1]?.totalCustomers || 0;

  const aggregatedMetrics = useMemo(() => {
    return calculateAggregatedMetrics(projections, financialMetrics);
  }, [projections, financialMetrics]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total Projetada"
          value={formatCurrency(totalRevenue)}
          trend={totalRevenue > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Custo Total Projetado"
          value={formatCurrency(totalCost)}
          trend="neutral"
        />
        <MetricCard
          title="ROI Médio"
          value={formatPercentage(averageROI / 100)}
          trend={averageROI > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Base de Clientes"
          value={totalCustomers.toLocaleString()}
          trend="up"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialMetricsChart />
        <CustomerMetricsChart />
      </div>

      <ProjectionMetricsChart />

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Projeções Detalhadas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Mês</th>
                <th className="px-4 py-2 text-right">Novos Clientes</th>
                <th className="px-4 py-2 text-right">Clientes Retidos</th>
                <th className="px-4 py-2 text-right">Receita</th>
                <th className="px-4 py-2 text-right">Custos</th>
                <th className="px-4 py-2 text-right">Lucro</th>
                <th className="px-4 py-2 text-right">ROI</th>
                <th className="px-4 py-2 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{p.month}</td>
                  <td className="px-4 py-2 text-right">{p.newCustomers}</td>
                  <td className="px-4 py-2 text-right">{p.retainedCustomers}</td>
                  <td className="px-4 py-2 text-right text-green-600">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="px-4 py-2 text-right text-red-600">
                    {formatCurrency(p.totalCost)}
                  </td>
                  <td className={`px-4 py-2 text-right ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(p.profit)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPercentage(p.roi / 100)}
                  </td>
                  <td className="px-4 py-2 text-right">{p.roas.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parâmetros de Projeção */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Parâmetros de Projeção</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Investimento Mensal
            </label>
            <input
              type="number"
              value={params.monthlyInvestment}
              onChange={(e) => updateParams({ monthlyInvestment: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              CAC (Custo de Aquisição)
            </label>
            <input
              type="number"
              value={params.cac}
              onChange={(e) => updateParams({ cac: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Margem (%)
            </label>
            <input
              type="number"
              value={params.margin * 100}
              onChange={(e) => updateParams({ margin: Number(e.target.value) / 100 })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Parâmetros Avançados
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Custo de Monetização por Cliente
              </label>
              <input
                type="number"
                value={params.monetizationCost}
                onChange={(e) => updateParams({ monetizationCost: Number(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Meses de Projeção
              </label>
              <input
                type="number"
                value={params.projectionMonths}
                onChange={(e) => updateParams({ projectionMonths: Number(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Projeções */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Mês</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Novos Clientes</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Clientes Retidos</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Receita</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Custos</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Lucro</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ROI</th>
              </tr>
            </thead>
            <tbody>
              {projectionData.map((projection) => (
                <tr key={projection.month} className="border-t">
                  <td className="px-4 py-2 text-sm">{projection.month}</td>
                  <td className="px-4 py-2 text-sm">{projection.newCustomers}</td>
                  <td className="px-4 py-2 text-sm">{projection.retainedCustomers}</td>
                  <td className="px-4 py-2 text-sm text-green-600">
                    {formatCurrency(projection.revenue)}
                  </td>
                  <td className="px-4 py-2 text-sm text-red-600">
                    {formatCurrency(projection.acquisitionCost + projection.monetizationCost)}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <span className={projection.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(projection.profit)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={projection.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {projection.roi.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para os cards de métricas
function MetricCard({ title, value, trend }: { 
  title: string; 
  value: string; 
  trend: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-2xl font-semibold mt-2 ${
        trend === 'up' ? 'text-green-600' : 
        trend === 'down' ? 'text-red-600' : 
        'text-gray-900'
      }`}>
        {value}
      </p>
    </div>
  );
} 