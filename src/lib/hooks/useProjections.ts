import { useState, useEffect } from 'react';
import { ProjectionParams, MonthlyProjection } from '../types/projections';
import { ProjectionService } from '../services/projectionService';

const DEFAULT_PARAMS: ProjectionParams = {
  monthlyInvestment: 10000,
  cac: 100,
  margin: 0.3,
  monetizationCost: 10,
  projectionMonths: 12
};

export function useProjections(initialParams: Partial<ProjectionParams> = {}) {
  const [params, setParams] = useState<ProjectionParams>({
    ...DEFAULT_PARAMS,
    ...initialParams
  });
  const [projections, setProjections] = useState<MonthlyProjection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const results = ProjectionService.calculateProjections(params);
      setProjections(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular projeções');
      setProjections([]);
    }
  }, [params]);

  const updateParams = (newParams: Partial<ProjectionParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    projections,
    params,
    updateParams,
    error
  };
} 