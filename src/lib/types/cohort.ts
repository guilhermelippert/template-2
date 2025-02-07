/**
 * Tipos para análise de coorte e projeções financeiras
 */

// Tipo para dados de retenção por mês
export interface CohortData {
  month: string; // Mês inicial (ex: "2024-01")
  initialCustomers: number; // Número inicial de clientes
  totalRevenue: number; // Receita total do mês inicial
  totalPurchases: number; // Número total de compras do mês inicial
  retentionRates: {
    [key: string]: number; // Chave é o mês (M1, M2, etc) e valor é a taxa de retenção
  };
  retentionData: {
    [key: string]: {
      revenue: number; // Receita do mês de retenção
      purchases: number; // Número de compras do mês de retenção
    };
  };
}

// Tipo para métricas financeiras
export interface FinancialMetrics {
  cac: number; // Custo de Aquisição de Cliente
  cpv: number; // Custo por Venda (não mais visualização)
  monthlyInvestment: number; // Investimento mensal
  averageTicket: number; // Ticket médio
  margin: number; // Margem de contribuição
  acquisitionInvestment: number; // Novo
  monetizationInvestment: number; // Novo
  marketingChannels?: { // Novo
    [channel: string]: {
      investment: number;
      cac: number;
      cpv: number; // Custo por Venda por canal
    };
  };
}

// Tipo para projeções mensais
export interface MonthlyProjection {
  month: string;
  newCustomers: number;
  retainedCustomers: number;
  totalCustomers: number;
  revenue: number;
  acquisitionCost: number;
  salesCost: number;
  monetizationCost: number;
  totalCost: number;
  profit: number;
  operationalMargin: number;
  roi: number;
  roas: number;
  margin: number;
  retentionRate: number;
  customerLifetimeValue: number;
}

// Tipo para dados de filtro
export interface CohortFilters {
  channel?: string;
  ticketRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

// Novo tipo para dados brutos do upload
export interface RawUploadData {
  cpf: string;
  purchaseDate: string;
  purchaseValue: number;
  [key: string]: any; // Para campos adicionais que podem vir do arquivo
}

// Tipo para mapeamento de colunas
export interface ColumnMapping {
  cpf: string;
  purchaseDate: string;
  purchaseValue: string;
  [key: string]: string;
}

// Tipo para validação de dados
export interface DataValidation {
  duplicateCPFs: string[];
  invalidDates: string[];
  invalidValues: string[];
  missingRequired: string[];
}

// Tipo para configuração de integração
export interface IntegrationConfig {
  type: 'manual' | 'api';
  apiKey?: string;
  platform?: string;
  credentials?: {
    [key: string]: string;
  };
}

export type AnalysisStep = 
  | 'upload'        // Etapa 1: Upload de dados
  | 'mapping'       // Etapa 2: Mapeamento de colunas
  | 'additional'    // Etapa 3: Plano de Growth
  | 'visualization' // Etapa 4: Projeções 