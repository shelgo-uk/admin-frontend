import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { SharedService } from '../../shared/services/shared.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  dataLabels?: ApexDataLabels;
  colors?: string[];
  grid?: ApexGrid;
  stroke?: ApexStroke;
  fill?: ApexFill;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  dashboardData: any = null;
  isLoading = true;
  chartPeriod: 'week' | 'month' | 'year' = 'month';
  salesChartOptions: Partial<ChartOptions> = {};

  readonly periodOptions: { key: 'week' | 'month' | 'year'; label: string }[] = [
    { key: 'week', label: '7D' },
    { key: 'month', label: '30D' },
    { key: 'year', label: '12M' }
  ];

  private readonly emptySummary = {
    totalSales: 0,
    todaySales: 0,
    monthSales: 0,
    weekSales: 0,
    totalOrders: 0,
    todayOrders: 0,
    monthOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalProducts: 0,
    contactLeads: 0
  };

  constructor(
    public sharedservice: SharedService,
    private dashboardservice: DashboardService
  ) {}

  get summary() {
    return this.dashboardData?.summary ?? this.emptySummary;
  }

  get kpiCards() {
    const s = this.summary;
    return [
      { label: 'Revenue', value: this.fmtMoney(s.totalSales), icon: 'fa-sterling-sign' },
      { label: 'Orders', value: this.fmtNum(s.totalOrders), icon: 'fa-bag-shopping' },
      { label: 'This month', value: this.fmtMoney(s.monthSales), hint: `${s.monthOrders} orders`, icon: 'fa-calendar' },
      { label: 'Today', value: this.fmtMoney(s.todaySales), hint: `${s.todayOrders} orders`, icon: 'fa-bolt' },
      { label: 'Pending', value: this.fmtNum(s.pendingOrders), icon: 'fa-clock', alert: s.pendingOrders > 0 }
    ];
  }

  get overviewItems() {
    const s = this.summary;
    return [
      { label: 'Avg. order', value: this.fmtMoney(s.averageOrderValue) },
      { label: 'Customers', value: this.fmtNum(s.totalCustomers) },
      { label: 'Products', value: this.fmtNum(s.totalProducts) },
      { label: 'Leads', value: this.fmtNum(s.contactLeads) }
    ];
  }

  get statusItems() {
    return this.dashboardData?.ordersByStatus || [];
  }

  get recentOrders() {
    return (this.dashboardData?.recentOrders || []).slice(0, 6);
  }

  get topProducts() {
    return (this.dashboardData?.topProducts || []).slice(0, 5);
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  get currency(): string {
    return this.sharedservice.currency;
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardservice.AdminDashboard(this.chartPeriod).subscribe({
      next: (res: any) => {
        this.dashboardData = this.normalizeDashboardResponse(res);
        this.buildChart();
        this.isLoading = false;
      },
      error: () => {
        this.dashboardData = null;
        this.isLoading = false;
        this.sharedservice.showAlert(3, 'Failed to load dashboard data');
      }
    });
  }

  private normalizeDashboardResponse(res: any) {
    const data = res?.data;
    if (!data) return null;

    if (data.summary) {
      return {
        summary: { ...this.emptySummary, ...data.summary },
        ordersByStatus: data.ordersByStatus || [],
        salesChart: data.salesChart || [],
        recentOrders: data.recentOrders || [],
        topProducts: data.topProducts || []
      };
    }

    const legacy = Array.isArray(data) ? data[0] : data;
    return {
      summary: {
        ...this.emptySummary,
        totalUsers: legacy?.users ?? 0,
        contactLeads: legacy?.submissions ?? 0
      },
      ordersByStatus: [],
      salesChart: [],
      recentOrders: [],
      topProducts: []
    };
  }

  setChartPeriod(period: 'week' | 'month' | 'year'): void {
    if (this.chartPeriod === period) return;
    this.chartPeriod = period;
    this.loadDashboard();
  }

  private buildChart(): void {
    const chart = this.dashboardData?.salesChart || [];
    const labels = chart.map((c: any) => c.label);
    const sales = chart.map((c: any) => c.sales);

    this.salesChartOptions = {
      series: [{ name: 'Sales', data: sales }],
      chart: { type: 'area', height: 220, toolbar: { show: false }, fontFamily: 'inherit', sparkline: { enabled: false } },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '10px', colors: '#94a3b8' }, hideOverlappingLabels: true }
      },
      yaxis: {
        labels: {
          style: { fontSize: '10px', colors: '#94a3b8' },
          formatter: (val: number) => `${this.currency}${Math.round(val)}`
        }
      },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4, padding: { left: 8, right: 8 } },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.8, opacityFrom: 0.35, opacityTo: 0.02 }
      }
    };
  }

  statusPercent(count: number): number {
    const total = this.summary.totalOrders || 0;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  statusChipClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'yellow',
      confirmed: 'blue',
      processing: 'blue',
      shipped: 'green',
      delivered: 'green',
      cancelled: 'red'
    };
    return map[status] || '';
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  private fmtMoney(val: number): string {
    return `${this.currency}${(val || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  private fmtNum(val: number): string {
    return (val || 0).toLocaleString('en-GB');
  }
}
