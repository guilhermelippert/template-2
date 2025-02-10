"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import CohortRetentionChart from './charts/CohortRetentionChart';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Definindo a interface para os filtros
interface FilterState {
  acquisitionChannel: string;
  ticketRange: {
    min: number | '';
    max: number | '';
  };
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export default function CohortAnalysis() {
  const { 
    cohortData, 
    rawData, 
    columnMapping, 
    financialMetrics,
    processData 
  } = useAnalytics();

  // Estado para os filtros
  const [filters, setFilters] = useState<FilterState>({
    acquisitionChannel: '',
    ticketRange: {
      min: '',
      max: ''
    },
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  // Estado para dados filtrados
  const [filteredCohortData, setFilteredCohortData] = useState(cohortData);

  // Função para aplicar filtros (atualizada com logs e lógica corrigida)
  const applyFilters = () => {
    let filtered = [...cohortData];

    if (filters.acquisitionChannel) {
      filtered = filtered.filter(cohort => 
        cohort.acquisitionChannel === filters.acquisitionChannel
      );
    }

    if (filters.ticketRange.min !== '') {
      filtered = filtered.filter(cohort => 
        cohort.averageTicket >= filters.ticketRange.min
      );
    }

    if (filters.ticketRange.max !== '') {
      filtered = filtered.filter(cohort => 
        cohort.averageTicket <= filters.ticketRange.max
      );
    }

    if (filters.dateRange.from && filters.dateRange.to) {
      filtered = filtered.filter(cohort => {
        // Normaliza a data do cohort para o início do mês
        const [year, month] = cohort.month.split('-').map(Number);
        const cohortDate = new Date(year, month - 1, 1);
        
        // Normaliza as datas de filtro para o início do mês
        const fromDate = new Date(
          filters.dateRange.from!.getFullYear(),
          filters.dateRange.from!.getMonth(),
          1
        );
        
        const toDate = new Date(
          filters.dateRange.to!.getFullYear(),
          filters.dateRange.to!.getMonth() + 1,
          0
        );

        return cohortDate >= fromDate && cohortDate <= toDate;
      });
    }

    setFilteredCohortData(filtered);
  };

  // Efeito para processar dados iniciais
  useEffect(() => {
    if (rawData.length > 0 && columnMapping && cohortData.length === 0) {
      processData();
    }
  }, [rawData, columnMapping, cohortData]);

  // Efeito para aplicar filtros quando os dados ou filtros mudam
  useEffect(() => {
    applyFilters();
  }, [cohortData, filters]);

  // Calcula os meses para as colunas da tabela
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);

  return (
    <div className="space-y-6">
      {/* Filtros no topo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filtros de Análise</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal de Aquisição
            </label>
            <select 
              className="w-full border rounded-md py-2 px-3"
              value={filters.acquisitionChannel}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                acquisitionChannel: e.target.value
              }))}
            >
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
                value={filters.ticketRange.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  ticketRange: {
                    ...prev.ticketRange,
                    min: e.target.value ? Number(e.target.value) : ''
                  }
                }))}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 border rounded-md py-2 px-3"
                value={filters.ticketRange.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  ticketRange: {
                    ...prev.ticketRange,
                    max: e.target.value ? Number(e.target.value) : ''
                  }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: {
                          from: range?.from,
                          to: range?.to
                        }
                      }));
                    }}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Retenção */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Retenção por Coorte</h3>
        <CohortRetentionChart data={filteredCohortData} />
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
              {filteredCohortData.map((cohort) => (
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
    </div>
  );
} 