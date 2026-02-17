import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-server-detail-chart',
    standalone: false,
    templateUrl: './server-detail-chart.component.html',
    styleUrls: ['./server-detail-chart.component.scss'],
})
export class ServerDetailChartComponent implements OnInit, OnChanges {
    @Input() serverId: string | undefined;

    @Input() uptimeHours = 0;

    Highcharts: typeof Highcharts = Highcharts;

    chartOptions: Highcharts.Options = {};

    ngOnInit(): void {
        this.generateChartData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['serverId'] || changes['uptimeHours']) {
            this.generateChartData();
        }
    }

    private generateChartData(): void {
        // Generate mock CPU usage data for the last 24 hours
        const dataPoints: [number, number][] = [];
        const now = Date.now();
        const hoursToShow = Math.min(24, Math.max(1, Math.floor(this.uptimeHours)));

        // Generate hourly data points
        for (let i = hoursToShow; i >= 0; i--) {
            const timestamp = now - (i * 60 * 60 * 1000);
            // Generate realistic CPU usage (20-80% range with some variation)
            // Higher variation for servers with more uptime
            const baseUsage = 40 + (Math.sin(i / 3) * 15);
            const variation = (Math.random() - 0.5) * 20;
            const cpuUsage = Math.max(10, Math.min(90, baseUsage + variation));
            dataPoints.push([timestamp, Math.round(cpuUsage * 10) / 10]);
        }

        this.chartOptions = {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: 300,
            },
            title: {
                text: 'CPU Usage Over Time',
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                },
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Time',
                },
                labels: {
                    format: '{value:%H:%M}',
                },
            },
            yAxis: {
                title: {
                    text: 'CPU Usage (%)',
                },
                min: 0,
                max: 100,
                labels: {
                    format: '{value}%',
                },
            },
            tooltip: {
                formatter: function () {
                    const date = new Date(this.x as number);
                    return `<b>${date.toLocaleString()}</b><br/>CPU Usage: ${this.y}%`;
                },
            },
            series: [
                {
                    name: 'CPU Usage',
                    type: 'area',
                    data: dataPoints,
                    color: '#4a90e2',
                    lineWidth: 2,
                    marker: {
                        enabled: false,
                        radius: 3,
                    },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(74, 144, 226, 0.3)'],
                            [1, 'rgba(74, 144, 226, 0.05)'],
                        ],
                    },
                    fillOpacity: 0.3,
                } as Highcharts.SeriesOptionsType,
            ],
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false,
            },
        };
    }
}
