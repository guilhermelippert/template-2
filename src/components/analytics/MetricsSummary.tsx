"use client";

import { useAnalyticsMetrics } from '@/lib/hooks/useAnalyticsMetrics';
import { formatCurrency } from '@/lib/utils/format';

export default function MetricsSummary() {
  const { metrics, loading } = useAnalyticsMetrics();

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">
          Nenhum dado disponível. Faça upload de uma planilha para ver as métricas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Resumo das Métricas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Métricas Gerais */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-1">Total de Clientes</h3>
          <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-1">Ticket Médio</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.averageTicket)}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-1">Receita Total</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>

        {/* Últimas Métricas Mensais */}
        {Object.entries(metrics.monthlyMetrics)
          .slice(-3)
          .map(([month, data]) => (
            <div key={month} className="border rounded-lg p-4">
              <h3 className="text-sm text-gray-500 mb-2">{month}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Novos Clientes:</span>
                  <p className="text-lg font-semibold">{data.newCustomers}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Clientes Recorrentes:</span>
                  <p className="text-lg font-semibold">{data.repeatCustomers}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Receita:</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(data.revenue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Taxas de Retenção</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Mês Base</th>
                {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(month => (
                  <th key={month} className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.retentionRates).map(([baseMonth, rates]) => (
                <tr key={baseMonth} className="border-t">
                  <td className="px-4 py-2 text-sm font-medium">{baseMonth}</td>
                  {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(month => (
                    <td key={month} className="px-4 py-2 text-sm">
                      {rates[month] ? `${(rates[month] * 100).toFixed(1)}%` : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 