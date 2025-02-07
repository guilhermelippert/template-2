import { useState, useEffect } from 'react';
import { AnalyticsMetrics } from '../types/analytics';
import { AnalyticsService } from '../services/analyticsService';

export function useAnalyticsMetrics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedMetrics = AnalyticsService.getStoredMetrics();
    setMetrics(storedMetrics);
    setLoading(false);
  }, []);

  const refreshMetrics = () => {
    const storedMetrics = AnalyticsService.getStoredMetrics();
    setMetrics(storedMetrics);
  };

  const clearMetrics = () => {
    AnalyticsService.clearStoredMetrics();
    setMetrics(null);
  };

  return {
    metrics,
    loading,
    refreshMetrics,
    clearMetrics,
    hasMetrics: !!metrics
  };
} 