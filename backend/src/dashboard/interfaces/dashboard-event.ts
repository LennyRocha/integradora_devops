import { DashboardKpis } from '../types/dashboard-kpis';

export interface DashboardEvent {
  kpi: DashboardKpis;
  success: boolean;
  count: number;
  message?: string;
}
