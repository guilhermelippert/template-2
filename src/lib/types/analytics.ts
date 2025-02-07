export interface AnalyticsMetrics {
  // Métricas gerais
  totalCustomers: number;
  averageTicket: number;
  totalRevenue: number;
  
  // Métricas mensais
  monthlyMetrics: {
    [key: string]: { // chave é o mês em formato YYYY-MM
      newCustomers: number;
      revenue: number;
      averageTicket: number;
      repeatCustomers: number;
    }
  };
  
  // Métricas de retenção
  retentionRates: {
    [key: string]: { // chave é o mês em formato YYYY-MM
      M1?: number;
      M2?: number;
      M3?: number;
      M4?: number;
      M5?: number;
      M6?: number;
    }
  };
  
  // Metadados
  lastUpdated: string;
  dataVersion: string;
} 