import { AnalyticsMetrics } from '../types/analytics';
import { RawUploadData } from '../types/cohort';

const STORAGE_KEY = 'analytics_metrics';
const CURRENT_VERSION = '1.0.0';

export class AnalyticsService {
  static async processAndStore(rawData: RawUploadData[]) {
    try {
      const metrics = await this.calculateMetrics(rawData);
      this.storeMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Erro ao processar métricas:', error);
      throw error;
    }
  }

  static async calculateMetrics(rawData: RawUploadData[]): Promise<AnalyticsMetrics> {
    // Inicializar estrutura de métricas
    const metrics: AnalyticsMetrics = {
      totalCustomers: 0,
      averageTicket: 0,
      totalRevenue: 0,
      monthlyMetrics: {},
      retentionRates: {},
      lastUpdated: new Date().toISOString(),
      dataVersion: CURRENT_VERSION
    };

    // Sets para controle de clientes únicos
    const uniqueCustomers = new Set<string>();
    const monthlyCustomers: { [key: string]: Set<string> } = {};
    const monthlyNewCustomers: { [key: string]: Set<string> } = {};

    // Processar dados brutos
    rawData.forEach(row => {
      // Corrigir a criação da data
      let purchaseDate: Date;
      
      try {
        // Verifica se já é um objeto Date
        if (row.data_compra instanceof Date) {
          purchaseDate = row.data_compra;
        } 
        // Se for timestamp numérico
        else if (typeof row.data_compra === 'number') {
          purchaseDate = new Date(row.data_compra);
        }
        // Se for string
        else if (typeof row.data_compra === 'string') {
          purchaseDate = new Date(row.data_compra.split('T')[0]);
        }
        // Caso não seja nenhum dos tipos acima
        else {
          purchaseDate = new Date(row.data_compra);
        }

        // Garantir que a data é válida
        if (isNaN(purchaseDate.getTime())) {
          console.error('Data inválida:', row.data_compra);
          return; // Pula este registro
        }

        // Formatar o mês corretamente
        const year = purchaseDate.getFullYear();
        const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`; // Formato YYYY-MM

        const purchaseValue = Number(row.valor_compra);
        const customerKey = row.cpf;

        // Inicializar estruturas do mês se necessário
        if (!monthlyCustomers[monthKey]) {
          monthlyCustomers[monthKey] = new Set();
          monthlyNewCustomers[monthKey] = new Set();
          metrics.monthlyMetrics[monthKey] = {
            newCustomers: 0,
            revenue: 0,
            averageTicket: 0,
            repeatCustomers: 0
          };
        }

        // Atualizar métricas mensais
        monthlyCustomers[monthKey].add(customerKey);
        metrics.monthlyMetrics[monthKey].revenue += purchaseValue;

        // Verificar se é cliente novo
        if (!uniqueCustomers.has(customerKey)) {
          monthlyNewCustomers[monthKey].add(customerKey);
        }

        // Atualizar métricas globais
        uniqueCustomers.add(customerKey);
        metrics.totalRevenue += purchaseValue;
      } catch (error) {
        console.error('Erro ao processar data:', row.data_compra, error);
        return; // Pula este registro em caso de erro
      }
    });

    // Calcular métricas finais
    metrics.totalCustomers = uniqueCustomers.size;
    metrics.averageTicket = metrics.totalRevenue / rawData.length;

    // Calcular métricas mensais finais
    Object.keys(monthlyCustomers).forEach(month => {
      const monthMetrics = metrics.monthlyMetrics[month];
      monthMetrics.newCustomers = monthlyNewCustomers[month].size;
      monthMetrics.averageTicket = monthMetrics.revenue / monthlyCustomers[month].size;
      monthMetrics.repeatCustomers = monthlyCustomers[month].size - monthlyNewCustomers[month].size;
    });

    // Calcular taxas de retenção
    metrics.retentionRates = this.calculateRetentionRates(monthlyCustomers);

    return metrics;
  }

  private static calculateRetentionRates(monthlyCustomers: { [key: string]: Set<string> }) {
    // Garantir que os meses estão ordenados corretamente
    const months = Object.keys(monthlyCustomers).sort((a, b) => {
      const dateA = new Date(a + '-01');
      const dateB = new Date(b + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    const retentionRates: AnalyticsMetrics['retentionRates'] = {};

    months.forEach((baseMonth, index) => {
      retentionRates[baseMonth] = {};
      const baseCustomers = monthlyCustomers[baseMonth];

      // Calcular retenção para os próximos 6 meses
      for (let i = 1; i <= 6; i++) {
        if (index + i < months.length) {
          const targetMonth = months[index + i];
          const targetCustomers = monthlyCustomers[targetMonth];
          
          // Corrigido: Convertendo Set para Array antes de filtrar
          const retainedCustomers = Array.from(baseCustomers)
            .filter(customer => targetCustomers.has(customer));
          
          // Tipagem explícita para evitar erro de índice
          const monthKey = `M${i}` as keyof typeof retentionRates[typeof baseMonth];
          retentionRates[baseMonth][monthKey] = retainedCustomers.length / baseCustomers.size;
        }
      }
    });

    return retentionRates;
  }

  static storeMetrics(metrics: AnalyticsMetrics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }

  static getStoredMetrics(): AnalyticsMetrics | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static clearStoredMetrics() {
    localStorage.removeItem(STORAGE_KEY);
  }
} 