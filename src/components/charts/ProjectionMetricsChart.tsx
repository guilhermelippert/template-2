"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils/format";

export default function ProjectionMetricsChart() {
  const { projections } = useAnalytics();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Projeções de Métricas Financeiras</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => formatCurrency(value).slice(0, -3) + 'K'}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                switch (name) {
                  case 'ROI':
                  case 'Margem':
                    return [`${value.toFixed(1)}%`, name];
                  default:
                    return [formatCurrency(value), name];
                }
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              name="Receita"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalCost"
              stroke="#EF4444"
              name="Custos"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roi"
              stroke="#6366F1"
              name="ROI"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke="#F59E0B"
              name="Margem"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 