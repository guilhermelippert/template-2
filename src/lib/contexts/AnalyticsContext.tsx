"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AnalysisStep,
  CohortData,
  FinancialMetrics,
  MonthlyProjection,
  CohortFilters,
  RawUploadData,
  ColumnMapping,
  DataValidation,
  IntegrationConfig,
} from "../types/cohort";
import { calculateProjections } from '../utils/projectionCalculations';

interface AnalyticsContextType {
  // Controle de etapas
  currentStep: AnalysisStep;
  setCurrentStep: (step: AnalysisStep) => void;
  canProceedToNext: boolean;
  
  // Estados de dados
  rawData: RawUploadData[];
  cohortData: CohortData[];
  financialMetrics: FinancialMetrics;
  projections: MonthlyProjection[];
  
  // Estados de upload e validação
  columnMapping: ColumnMapping | null;
  dataValidation: DataValidation | null;
  integrationConfig: IntegrationConfig | null;
  
  // Funções de atualização
  uploadData: (data: RawUploadData[]) => void;
  updateColumnMapping: (mapping: ColumnMapping) => void;
  validateData: () => DataValidation;
  updateFinancialMetrics: (metrics: Partial<FinancialMetrics>) => void;
  updateIntegrationConfig: (config: IntegrationConfig) => void;
  processData: () => void; // Função para processar dados após validação
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const initialFinancialMetrics: FinancialMetrics = {
  cac: 0,
  cpv: 0,
  monthlyInvestment: 0,
  averageTicket: 0,
  margin: 0,
  acquisitionInvestment: 0,
  monetizationInvestment: 0,
};

// Função auxiliar para parsear datas em diferentes formatos
const parseDate = (dateStr: string | number): Date => {
  // Se for número (Excel), converter de Excel para Data
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }

  // Se for string, tentar diferentes formatos
  const cleanDate = dateStr.toString().replace(/[^\d]/g, '/');
  const parts = cleanDate.split('/');
  
  if (parts.length !== 3) {
    throw new Error(`Formato de data inválido: ${dateStr}`);
  }

  // Converter todos os componentes para números
  const nums = parts.map(p => parseInt(p, 10));
  
  // Validar que todos os componentes são números válidos
  if (nums.some(n => isNaN(n))) {
    throw new Error(`Componentes de data inválidos: ${dateStr}`);
  }

  // Função auxiliar para verificar se uma data é válida
  const isValidDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  // Tentar diferentes formatos possíveis
  let possibleDates = [
    // DD/MM/YYYY
    { year: nums[2], month: nums[1], day: nums[0] },
    // MM/DD/YYYY
    { year: nums[2], month: nums[0], day: nums[1] },
  ];

  // Se algum número parece ser um ano (>31), considerar também YYYY/MM/DD
  if (nums[0] > 31) {
    possibleDates.push({ year: nums[0], month: nums[1], day: nums[2] });
  }

  // Filtrar datas válidas
  const validDates = possibleDates.filter(({ year, month, day }) => {
    // Validações básicas
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // Verificar se a data é válida (considera meses com 30/31 dias e anos bissextos)
    return isValidDate(year, month, day);
  });

  if (validDates.length === 0) {
    throw new Error(`Não foi possível interpretar a data: ${dateStr}`);
  }

  // Se houver múltiplas datas válidas, preferir o formato DD/MM/YYYY
  const dateToUse = validDates[0];
  return new Date(dateToUse.year, dateToUse.month - 1, dateToUse.day);
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Controle de etapas
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('upload');
  
  // Estados de dados
  const [rawData, setRawData] = useState<RawUploadData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>(initialFinancialMetrics);
  const [projections, setProjections] = useState<MonthlyProjection[]>([]);
  
  // Estados de upload e validação
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [dataValidation, setDataValidation] = useState<DataValidation | null>(null);
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig | null>(null);

  // Determina se pode avançar para a próxima etapa
  const canProceedToNext = React.useMemo(() => {
    switch (currentStep) {
      case 'upload':
        return rawData.length > 0;
      case 'mapping':
        return columnMapping !== null;
      case 'additional':
        return financialMetrics.cac > 0 && financialMetrics.margin > 0;
      case 'visualization':
        return true;
      default:
        return false;
    }
  }, [currentStep, rawData, columnMapping, financialMetrics]);

  // Função para upload de dados
  const uploadData = (data: RawUploadData[]) => {
    setRawData(data);
    // Resetar estados relacionados
    setColumnMapping(null);
    setDataValidation(null);
  };

  // Função para atualizar mapeamento de colunas
  const updateColumnMapping = (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
  };

  // Função para validar dados
  const validateData = (): DataValidation => {
    // Implementar lógica de validação aqui
    const validation: DataValidation = {
      duplicateCPFs: [],
      invalidDates: [],
      invalidValues: [],
      missingRequired: [],
    };
    
    // Atualizar estado de validação
    setDataValidation(validation);
    return validation;
  };

  // Função para processar dados após validação
  const processData = () => {
    if (!columnMapping || !rawData.length) {
      return;
    }

    try {
      // Agrupar dados por mês
      const groupedData = rawData.reduce((acc, curr) => {
        try {
          const date = parseDate(curr[columnMapping.purchaseDate]);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[monthKey]) {
            acc[monthKey] = {
              customers: new Set<string>(),
              totalValue: 0
            };
          }
          
          acc[monthKey].customers.add(curr[columnMapping.cpf]);
          acc[monthKey].totalValue += parseFloat(curr[columnMapping.purchaseValue]) || 0;
          
          return acc;
        } catch (err) {
          return acc;
        }
      }, {} as Record<string, { customers: Set<string>, totalValue: number }>);

      // Converter para formato de cohort
      const processedCohortData: CohortData[] = Object.entries(groupedData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          initialCustomers: data.customers.size,
          averageTicket: data.totalValue / data.customers.size,
          retentionRates: calculateRetentionRates(month, data.customers, groupedData)
        }));

      setCohortData(processedCohortData);

    } catch (error) {
      throw error;
    }
  };

  // Função auxiliar para calcular taxas de retenção
  const calculateRetentionRates = (
    baseMonth: string,
    baseCustomers: Set<string>,
    groupedData: Record<string, { customers: Set<string>, totalValue: number }>
  ) => {
    const rates: { [key: string]: number } = {};
    const months = Object.keys(groupedData).sort();
    const baseMonthIndex = months.indexOf(baseMonth);

    // Para cada mês após o mês base
    for (let i = baseMonthIndex + 1; i < months.length; i++) {
      const currentMonth = months[i];
      const monthNumber = i - baseMonthIndex;
      
      // Calcular quantos clientes do mês base compraram neste mês
      const retainedCustomers = Array.from(baseCustomers)
        .filter(customer => groupedData[currentMonth].customers.has(customer));
      
      // Calcular taxa de retenção
      rates[`M${monthNumber}`] = retainedCustomers.length / baseCustomers.size;
    }

    return rates;
  };

  useEffect(() => {
    if (cohortData.length > 0 && financialMetrics.cac > 0) {
      try {
        const calculatedProjections = calculateProjections(cohortData, financialMetrics);
        setProjections(calculatedProjections);
      } catch (error) {
        throw error;
      }
    }
  }, [cohortData, financialMetrics]);

  return (
    <AnalyticsContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        canProceedToNext,
        rawData,
        cohortData,
        financialMetrics,
        projections,
        columnMapping,
        dataValidation,
        integrationConfig,
        uploadData,
        updateColumnMapping,
        validateData,
        updateFinancialMetrics: (metrics) => 
          setFinancialMetrics((prev) => ({ ...prev, ...metrics })),
        updateIntegrationConfig: (config) => 
          setIntegrationConfig(config),
        processData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}; 