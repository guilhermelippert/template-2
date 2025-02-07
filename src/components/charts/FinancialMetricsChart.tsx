"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils/format";

export default function FinancialMetricsChart() {
  const { projections } = useAnalytics();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Métricas por Período</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value).slice(0, -3) + 'K'} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Valor"]}
            />
            <Legend />
            <Bar 
              dataKey="acquisitionCost" 
              name="Custo de Aquisição" 
              fill="#EF4444"
            />
            <Bar 
              dataKey="monetizationCost" 
              name="Custo de Monetização" 
              fill="#F59E0B"
            />
            <Bar 
              dataKey="profit" 
              name="Lucro" 
              fill="#10B981"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 