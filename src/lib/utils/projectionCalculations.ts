import { CohortData, FinancialMetrics, MonthlyProjection } from "../types/cohort";

export function calculateProjections(
  cohortData: CohortData[],
  financialMetrics: FinancialMetrics,
  monthsToProject: number = 12
): MonthlyProjection[] {
  const projections: MonthlyProjection[] = [];
  
  // Análise dos dados históricos
  const historicalMetrics = analyzeHistoricalData(cohortData);
  console.log("Métricas históricas:", historicalMetrics);

  // Inicialização
  let activeCustomers = getTotalCurrentCustomers(cohortData);
  let retainedBase = activeCustomers;

  // Valores iniciais e validações
  const metrics = { ...financialMetrics };
  let averageTicket = metrics.averageTicket || historicalMetrics.averageTicket;
  let retentionRate = historicalMetrics.retentionRate;
  let repeatPurchaseRate = historicalMetrics.repeatPurchaseRate;

  for (let i = 0; i < monthsToProject; i++) {
    const month = getProjectionMonth(i);
    
    // Novos clientes do investimento em aquisição
    const newCustomers = Math.floor(metrics.monthlyInvestment / metrics.cac);
    
    // Clientes retidos que farão recompra
    const repeatCustomers = Math.floor(retainedBase * repeatPurchaseRate);
    
    // Total de clientes ativos no mês
    const totalCustomers = newCustomers + repeatCustomers;
    
    // Atualizar base de clientes para próximo mês
    retainedBase = (retainedBase * retentionRate) + newCustomers;
    
    // Cálculos financeiros
    const revenue = totalCustomers * averageTicket;
    const acquisitionCost = newCustomers * metrics.cac;
    const marketingCost = totalCustomers * metrics.cpv;
    const retentionCost = retainedBase * (metrics.monetizationInvestment / activeCustomers);
    const totalCost = acquisitionCost + marketingCost + retentionCost;
    
    const marginValue = revenue * metrics.margin;
    const profit = marginValue - totalCost;
    
    projections.push({
      month,
      newCustomers,
      retainedCustomers: repeatCustomers,
      totalCustomers,
      revenue,
      acquisitionCost,
      salesCost: marketingCost,
      monetizationCost: retentionCost,
      totalCost,
      profit,
      operationalMargin: (marginValue / revenue) * 100,
      roi: (profit / totalCost) * 100,
      roas: revenue / totalCost,
      margin: metrics.margin * 100,
      retentionRate: retentionRate * 100,
      customerLifetimeValue: calculateLTV(averageTicket, metrics.margin, retentionRate)
    });
  }
  
  return projections;
}

function analyzeHistoricalData(cohortData: CohortData[]) {
  // Análise dos últimos 3 meses para métricas mais recentes
  const recentCohorts = cohortData.slice(-3);
  
  // Calcular taxa média de retenção
  const retentionRate = recentCohorts.reduce((sum, cohort) => {
    const rates = Object.values(cohort.retentionRates);
    return sum + (rates[0] || 0);
  }, 0) / recentCohorts.length;

  // Calcular taxa média de recompra
  let totalCustomers = 0;
  let totalRepeatPurchases = 0;

  recentCohorts.forEach(cohort => {
    totalCustomers += cohort.initialCustomers;
    
    // Soma todas as compras repetidas nos meses seguintes
    Object.values(cohort.retentionData || {}).forEach(monthData => {
      totalRepeatPurchases += monthData.purchases || 0;
    });
  });

  const repeatPurchaseRate = totalRepeatPurchases / totalCustomers;

  // Calcular ticket médio considerando todas as compras
  let totalRevenue = 0;
  let totalPurchases = 0;

  recentCohorts.forEach(cohort => {
    totalRevenue += cohort.totalRevenue || 0;
    totalPurchases += cohort.totalPurchases || 0;

    Object.values(cohort.retentionData || {}).forEach(monthData => {
      totalRevenue += monthData.revenue || 0;
      totalPurchases += monthData.purchases || 0;
    });
  });

  const averageTicket = totalPurchases > 0 ? totalRevenue / totalPurchases : 200;

  return {
    retentionRate: Math.max(0.1, retentionRate), // Mínimo de 10% de retenção
    repeatPurchaseRate: Math.max(0.05, repeatPurchaseRate), // Mínimo de 5% de recompra
    averageTicket: Math.max(50, averageTicket) // Mínimo de R$50 de ticket
  };
}

// Funções auxiliares atualizadas
function calculateAverageRetention(cohortData: CohortData[]): number {
  const recentCohorts = cohortData.slice(-3);
  if (recentCohorts.length === 0) return 0.3; // 30% como padrão
  
  const retentionRates = recentCohorts.map(cohort => {
    const rates = Object.values(cohort.retentionRates);
    return rates.length > 0 ? rates[0] : 0.3;
  });
  
  return retentionRates.reduce((a, b) => a + b, 0) / retentionRates.length;
}

function calculateAverageTicket(cohortData: CohortData[]): number {
  // Se não tiver dados, retorna valor padrão
  if (cohortData.length === 0) return 200;

  // Soma total de todas as compras
  let totalRevenue = 0;
  let totalPurchases = 0;

  // Para cada coorte
  cohortData.forEach(cohort => {
    // Soma as compras iniciais
    totalRevenue += cohort.totalRevenue || 0;
    totalPurchases += cohort.totalPurchases || 0;

    // Soma as compras de retenção
    Object.values(cohort.retentionData || {}).forEach(monthData => {
      totalRevenue += monthData.revenue || 0;
      totalPurchases += monthData.purchases || 0;
    });
  });

  // Evita divisão por zero
  if (totalPurchases === 0) return 200;

  // Retorna média de valor por compra
  return totalRevenue / totalPurchases;
}

function getTotalCurrentCustomers(cohortData: CohortData[]): number {
  const total = cohortData.reduce((total, cohort) => total + cohort.initialCustomers, 0);
  return Math.max(1, total); // Garantir pelo menos 1 cliente
}

function getProjectionMonth(monthsAhead: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toISOString().slice(0, 7); // Formato YYYY-MM
}

function calculateLTV(
  averageTicket: number,
  margin: number,
  retentionRate: number
): number {
  // Prevenir divisão por zero
  if (retentionRate >= 1) retentionRate = 0.99;
  if (retentionRate <= 0) retentionRate = 0.3;
  
  // LTV = Ticket Médio * Margem * (1 / (1 - Taxa de Retenção))
  return averageTicket * margin * (1 / (1 - retentionRate));
} 