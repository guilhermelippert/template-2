import { AnalyticsMetrics } from '../types/analytics';
import { ProjectionParams, MonthlyProjection } from '../types/projections';
import { AnalyticsService } from './analyticsService';

export class ProjectionService {
  static calculateProjections(params: ProjectionParams): MonthlyProjection[] {
    const metrics = AnalyticsService.getStoredMetrics();
    if (!metrics) {
      throw new Error('Nenhuma métrica disponível para cálculo de projeções');
    }

    return this.generateProjections(metrics, params);
  }

  private static generateProjections(
    metrics: AnalyticsMetrics,
    params: ProjectionParams
  ): MonthlyProjection[] {
    const projections: MonthlyProjection[] = [];
    const baseDate = new Date();
    
    // Calcular médias de retenção dos últimos meses
    const retentionRates = this.calculateAverageRetentionRates(metrics.retentionRates);
    
    // Estado inicial
    let currentCustomers = metrics.totalCustomers;
    let retainedCustomersHistory: number[] = [];

    for (let i = 0; i < params.projectionMonths; i++) {
      const month = this.getProjectionMonth(baseDate, i);
      
      // Calcular novos clientes baseado no investimento e CAC
      const newCustomers = Math.floor(params.monthlyInvestment / params.cac);
      
      // Calcular clientes retidos usando as taxas médias de retenção
      const retainedCustomers = this.calculateRetainedCustomers(
        retainedCustomersHistory,
        retentionRates
      );

      // Atualizar histórico de clientes para próximo mês
      retainedCustomersHistory.unshift(newCustomers);
      if (retainedCustomersHistory.length > 6) {
        retainedCustomersHistory.pop();
      }

      // Calcular métricas financeiras
      const totalCustomers = newCustomers + retainedCustomers;
      const revenue = totalCustomers * metrics.averageTicket;
      const acquisitionCost = params.monthlyInvestment;
      const monetizationCost = totalCustomers * params.monetizationCost;
      const profit = (revenue * params.margin) - acquisitionCost - monetizationCost;
      const roi = ((profit / (acquisitionCost + monetizationCost)) * 100);

      projections.push({
        month,
        newCustomers,
        retainedCustomers,
        totalCustomers,
        revenue,
        acquisitionCost,
        monetizationCost,
        profit,
        roi
      });

      currentCustomers = totalCustomers;
    }

    return projections;
  }

  private static calculateAverageRetentionRates(
    retentionRates: AnalyticsMetrics['retentionRates']
  ): number[] {
    const months = Object.keys(retentionRates);
    const rates: number[] = [];

    // Calcular média para cada mês de retenção (M1 a M6)
    for (let i = 1; i <= 6; i++) {
      const monthKey = `M${i}`;
      let sum = 0;
      let count = 0;

      months.forEach(month => {
        if (retentionRates[month][monthKey as keyof typeof retentionRates[typeof month]]) {
          sum += retentionRates[month][monthKey as keyof typeof retentionRates[typeof month]]!;
          count++;
        }
      });

      rates.push(count > 0 ? sum / count : 0);
    }

    return rates;
  }

  private static calculateRetainedCustomers(
    history: number[],
    retentionRates: number[]
  ): number {
    return history.reduce((total, customers, index) => {
      return total + Math.floor(customers * (retentionRates[index] || 0));
    }, 0);
  }

  private static getProjectionMonth(baseDate: Date, monthsToAdd: number): string {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + monthsToAdd);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
} 