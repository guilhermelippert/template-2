"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CohortRetentionChart() {
  const { cohortData } = useAnalytics();

  useEffect(() => {
    console.log("CohortRetentionChart - Dados recebidos:", {
      cohortDataLength: cohortData.length,
      firstCohort: cohortData[0]
    });
  }, [cohortData]);

  // Transformar dados para o formato do gráfico
  const chartData = cohortData.map((cohort) => {
    const transformed = {
      month: cohort.month,
      ...cohort.retentionRates,
    };
    console.log("CohortRetentionChart - Dados transformados:", transformed);
    return transformed;
  });

  // Se não houver dados, mostrar mensagem
  if (!chartData.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          Nenhum dado disponível para exibição do gráfico
        </p>
      </div>
    );
  }

  // Cores para as linhas do gráfico
  const colors = [
    "#2563eb", // blue-600
    "#16a34a", // green-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            }}
          />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          />
          <Tooltip
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            }}
          />
          <Legend />
          {Object.keys(chartData[0] || {})
            .filter(key => key.startsWith('M'))
            .map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                name={`Mês ${key.slice(1)}`}
                dot={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 