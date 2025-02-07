"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerMetricsChart() {
  const { projections } = useAnalytics();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução da Base de Clientes</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="newCustomers"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              name="Novos Clientes"
            />
            <Area
              type="monotone"
              dataKey="retainedCustomers"
              stackId="1"
              stroke="#6366F1"
              fill="#6366F1"
              name="Clientes Retidos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 