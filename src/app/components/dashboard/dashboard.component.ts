import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { SharedService } from '../../shared/services/shared.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  legend?: ApexLegend;
  colors?: string[];
  labels?: string[];
  grid?: ApexGrid;
  stroke: ApexStroke;
  activeFilter?: 'year' | 'month' | 'week';
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{

  dashboardData : any;
 
  constructor(public sharedservice : SharedService , private dashboardservice : DashboardService){
  }

  ngOnInit(): void {
    this.dashboardservice.AdminDashboard().subscribe((res : any) => {
      this.dashboardData = res.data[0];
    })
  }
}
