"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import CohortRetentionChart from './charts/CohortRetentionChart';

export default function CohortAnalysis() {
  const { 
    cohortData, 
    rawData, 
    columnMapping, 
    financialMetrics,
    processData 
  } = useAnalytics();

  useEffect(() => {
    console.log("CohortAnalysis - Estado inicial:", {
      rawDataLength: rawData.length,
      columnMapping,
      financialMetrics,
      cohortDataLength: cohortData.length
    });

    // Se temos todos os dados necessários mas não temos cohortData, processar
    if (rawData.length > 0 && columnMapping && cohortData.length === 0) {
      console.log("CohortAnalysis - Iniciando processamento dos dados");
      processData();
    }
  }, [rawData, columnMapping, cohortData]);

  // Calcula os meses para as colunas da tabela
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);

  return (
    <div className="space-y-6">
      {/* Gráfico de Retenção */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Retenção por Coorte</h3>
        <CohortRetentionChart />
      </div>

      {/* Tabela de Cohort */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 border text-left">Mês Inicial</th>
                <th className="py-3 px-4 border text-center">Clientes</th>
                {months.map((month) => (
                  <th key={month} className="py-3 px-4 border text-center">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.month}>
                  <td className="py-2 px-4 border">{cohort.month}</td>
                  <td className="py-2 px-4 border text-center">
                    {cohort.initialCustomers}
                  </td>
                  {months.map((month) => (
                    <td key={month} className="py-2 px-4 border text-center">
                      {cohort.retentionRates[month] ? (
                        <span className={cohort.retentionRates[month] > 0 ? "text-green-600" : "text-red-600"}>
                          {(cohort.retentionRates[month] * 100).toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canal de Aquisição
          </label>
          <select className="w-full border rounded-md py-2 px-3">
            <option value="">Todos</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
            <option value="organic">Orgânico</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faixa de Ticket
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 border rounded-md py-2 px-3"
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 border rounded-md py-2 px-3"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="w-1/2 border rounded-md py-2 px-3"
            />
            <input
              type="date"
              className="w-1/2 border rounded-md py-2 px-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 