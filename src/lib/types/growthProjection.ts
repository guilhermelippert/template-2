// Define o tipo de dados histórico de vendas
export interface SaleData {
  // Identificador único do cliente (CPF ou similar)
  id: string;
  // Data da venda no formato YYYY-MM-DD
  saleDate: string;
  // Valor da venda
  saleValue: number;
}

// Parâmetros do plano de crescimento para a projeção
export interface GrowthProjectionParams {
  // Valor investido mensalmente
  monthlyInvestment: number;
  // Custo de Aquisição de Cliente (CAC)
  cac: number;
  // Custo por Venda (CPV) – custo de monetização por cliente ou venda
  cpv: number;
  // Margem de contribuição (em decimal, ex: 0.3 para 30%)
  margin: number;
  // Número de meses para projeção (padrão 12, opcional)
  projectionMonths?: number;
}

// Estrutura da projeção para cada mês
export interface MonthlyGrowthProjection {
  // Mês da projeção (formato YYYY-MM)
  month: string;
  // Novos clientes adquiridos no mês
  newCustomers: number;
  // Clientes retidos do mês anterior
  retainedCustomers: number;
  // Total de clientes ativos no mês
  totalCustomers: number;
  // Receita prevista com base no ticket médio
  revenue: number;
  // Investimento destinado à aquisição
  acquisitionCost: number;
  // Custo de vendas (placeholder, se necessário)
  salesCost: number;
  // Custo de monetização
  monetizationCost: number;
  // Custo total (acquisitionCost + monetizationCost)
  totalCost: number;
  // Lucro previsto (considerando a margem de contribuição)
  profit: number;
  // Margem operacional (em %)
  operationalMargin: number;
  // Retorno sobre investimento (ROI em %)
  roi: number;
  // ROAS: Retorno sobre gasto em anúncios
  roas: number;
  // Margem de contribuição (em %)
  margin: number;
  // Taxa de retenção (em %)
  retentionRate: number;
  // Customer Lifetime Value (LTV)
  customerLifetimeValue: number;
} 