import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '../../services/dashboard';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data: any = null;

  rolesChart: any = {
    series: [],
    chart: { type: 'pie', height: 300 },
    labels: []
  };

  totalsChart: any = {
    series: [{ data: [] }],
    chart: { type: 'bar', height: 300 },
    xaxis: { categories: [] }
  };

  clientsChart: any = {
    series: [{ data: [] }],
    chart: { type: 'bar', height: 300 },
    xaxis: { categories: [] }
  };

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

ngOnInit(): void {
  this.dashboardService.getDashboard().subscribe({
    next: (res) => {
      this.data = res;

      this.rolesChart.series = res.rolesStats.map((r: any) => r.total);
      this.rolesChart.labels = res.rolesStats.map((r: any) => r.role);

      this.totalsChart.series = [
        { data: [res.totalUsers, res.totalClients] }
      ];
      this.totalsChart.xaxis.categories = ['Utilisateurs', 'Clients'];

      this.clientsChart = {
        series: [{
          name: 'Clients',
          data: res.clientsByMonth.map((c: any) => c.total)
        }],
        chart: {
          type: 'bar',
          height: 300,
          toolbar: { show: true }
        },
        xaxis: {
          categories: res.clientsByMonth.map((c: any) => c.month),
          type: 'category'
        }
      };

      this.cdr.detectChanges(); // 🔥 IMPORTANT
    },
    error: (err) => {
      console.error('Erreur dashboard API', err);
    }
  });
}

}