import { SaleData, GrowthProjectionParams, MonthlyGrowthProjection } from "@/lib/types/growthProjection";
import { CohortData } from "@/lib/types/cohort";

// Função auxiliar para calcular métricas históricas: ticket médio, taxa de retenção e base de clientes
function calculateHistoricalMetrics(salesData: SaleData[]): { 
  averageTicket: number; 
  overallRetentionRate: number; 
  baseCustomers: number;
  monthlyRetentionRates: number[];
} {
  // Calcula receita total e ticket médio
  const totalSales = salesData.length;
  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.saleValue, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Agrupa vendas por mês e cliente
  const monthlyCustomers: Record<string, Set<string>> = {};
  const customerFirstPurchase: Record<string, string> = {};

  salesData.forEach(sale => {
    const date = new Date(sale.saleDate);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Inicializa o conjunto de clientes do mês se necessário
    if (!monthlyCustomers[monthKey]) {
      monthlyCustomers[monthKey] = new Set();
    }
    
    monthlyCustomers[monthKey].add(sale.id);

    // Registra o primeiro mês de compra do cliente se ainda não existir
    if (!customerFirstPurchase[sale.id]) {
      customerFirstPurchase[sale.id] = monthKey;
    }
  });

  // Ordena os meses
  const months = Object.keys(monthlyCustomers).sort();
  
  // Pega apenas os últimos 6 meses para análise mais recente
  const recentMonths = months.slice(-6);
  
  // Calcula as taxas de retenção por período (M1, M2, M3, etc.)
  const retentionByPeriod: number[][] = [];

  recentMonths.forEach((cohortMonth, index) => {
    if (index === recentMonths.length - 1) return;

    const cohortCustomers = new Set(
      Array.from(monthlyCustomers[cohortMonth])
    );

    if (cohortCustomers.size === 0) return;

    const periodRetentions: number[] = [];
    
    // Calcula retenção para cada período subsequente
    for (let i = index + 1; i < recentMonths.length; i++) {
      const futureMonth = recentMonths[i];
      const retainedCustomers = Array.from(cohortCustomers)
        .filter(customer => monthlyCustomers[futureMonth].has(customer));
      
      const retentionRate = retainedCustomers.length / cohortCustomers.size;
      periodRetentions.push(retentionRate);
    }

    if (periodRetentions.length > 0) {
      retentionByPeriod.push(periodRetentions);
    }
  });

  // Calcula a média de retenção para cada período (M1, M2, M3, etc.)
  const monthlyRetentionRates = calculateAverageRetentionRates(retentionByPeriod);

  // Define a base inicial como a média dos últimos 3 meses
  const baseCustomers = calculateCurrentCustomerBase(monthlyCustomers, months);

  return {
    averageTicket,
    overallRetentionRate: monthlyRetentionRates[0] || 0,
    baseCustomers,
    monthlyRetentionRates
  };
}

// Nova função para calcular médias de retenção
function calculateAverageRetentionRates(retentionByPeriod: number[][]): number[] {
  const maxPeriods = Math.max(...retentionByPeriod.map(rates => rates.length));
  const averageRates: number[] = [];

  for (let period = 0; period < maxPeriods; period++) {
    const ratesForPeriod = retentionByPeriod
      .map(rates => rates[period])
      .filter(rate => rate !== undefined);

    if (ratesForPeriod.length > 0) {
      const avgRate = ratesForPeriod.reduce((sum, rate) => sum + rate, 0) / ratesForPeriod.length;
      averageRates.push(Math.max(avgRate, 0.05)); // Mínimo de 5% de retenção
    }
  }

  return averageRates;
}

// Nova função para calcular base atual de clientes
function calculateCurrentCustomerBase(
  monthlyCustomers: Record<string, Set<string>>,
  months: string[]
): number {
  const last3Months = months.slice(-3);
  return Math.floor(
    last3Months.reduce((sum, month) => 
      sum + (monthlyCustomers[month]?.size || 0), 0
    ) / 3
  );
}

// Função auxiliar para calcular o Customer Lifetime Value (LTV)
function calculateLTV(averageTicket: number, margin: number, retentionRate: number): number {
  return retentionRate < 1 ? (averageTicket * margin) / (1 - retentionRate) : 0;
}

// Função para extrair taxas de retenção do cohortData
function extractRetentionRates(cohortData: CohortData[]): number[] {
  const averageRates: number[] = [];
  
  // Para cada período (M1 até M12)
  for (let i = 1; i <= 12; i++) {
    const monthKey = `M${i}`;
    const rates = cohortData
      .map(cohort => cohort.retentionRates[monthKey])
      .filter(rate => rate !== undefined);
    
    if (rates.length > 0) {
      const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      averageRates.push(avgRate);
    }
  }
  
  return averageRates;
}

// Função principal para gerar as projeções de crescimento
export function generateGrowthProjections(
  salesData: SaleData[],
  growthParams: GrowthProjectionParams,
  cohortData?: CohortData[],
  adjustedRetentionRates?: number[]
): MonthlyGrowthProjection[] {
  const projectionMonths = growthParams.projectionMonths || 12;
  const projections: MonthlyGrowthProjection[] = [];
  
  // Calcula o ticket médio dos dados históricos
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.saleValue, 0);
  const averageTicket = totalRevenue / salesData.length;
  
  // Usar taxas ajustadas se fornecidas, caso contrário calcular do cohortData
  const retentionRates = adjustedRetentionRates || 
    (cohortData ? extractRetentionRates(cohortData) : []);
  console.log('Retention Rates:', retentionRates); // Debug
  
  // Array para manter histórico de coortes
  const cohorts: { month: number; customers: number }[] = [];
  
  for (let i = 0; i < projectionMonths; i++) {
    const currentDate = new Date();
    const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
    const monthKey = `${projectionDate.getFullYear()}-${(projectionDate.getMonth() + 1).toString().padStart(2, '0')}`;

    // Novos clientes deste mês
    const newCustomers = Math.floor(growthParams.monthlyInvestment / growthParams.cac);
    
    // Adiciona nova coorte
    cohorts.push({ month: i, customers: newCustomers });
    
    // Calcula clientes retidos de todas as coortes anteriores
    let retainedCustomers = 0;
    cohorts.forEach((cohort, index) => {
      const monthsAgo = i - cohort.month;
      if (monthsAgo > 0 && monthsAgo <= retentionRates.length) {
        const retentionRate = retentionRates[monthsAgo - 1];
        const retained = Math.floor(cohort.customers * retentionRate);
        retainedCustomers += retained;
      }
    });

    // Total de clientes ativos
    const totalCustomers = newCustomers + retainedCustomers;

    // Cálculos financeiros
    const revenue = totalCustomers * averageTicket;
    const acquisitionCost = growthParams.monthlyInvestment;
    const monetizationCost = totalCustomers * growthParams.cpv;
    const totalCost = acquisitionCost + monetizationCost;
    const profit = (revenue * growthParams.margin) - totalCost;

    projections.push({
      month: monthKey,
      newCustomers,
      retainedCustomers,
      totalCustomers,
      revenue,
      acquisitionCost,
      salesCost: 0,
      monetizationCost,
      totalCost,
      profit,
      operationalMargin: revenue !== 0 ? (profit / revenue) * 100 : 0,
      roi: totalCost !== 0 ? (profit / totalCost) * 100 : 0,
      roas: totalCost !== 0 ? revenue / totalCost : 0,
      margin: growthParams.margin * 100,
      retentionRate: retainedCustomers > 0 ? (retainedCustomers / (totalCustomers - newCustomers)) * 100 : 0,
      customerLifetimeValue: calculateLTV(averageTicket, growthParams.margin, retentionRates[0] || 0),
    });
  }

  return projections;
} 