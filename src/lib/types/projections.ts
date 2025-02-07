export interface ProjectionParams {
  monthlyInvestment: number;
  cac: number;
  margin: number;
  monetizationCost: number;
  projectionMonths: number;
}

export interface MonthlyProjection {
  month: string;
  newCustomers: number;
  retainedCustomers: number;
  totalCustomers: number;
  revenue: number;
  acquisitionCost: number;
  monetizationCost: number;
  profit: number;
  roi: number;
} 