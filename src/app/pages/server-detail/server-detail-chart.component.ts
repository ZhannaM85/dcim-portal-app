import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as Highcharts from 'highcharts';

@Component({
    selector: 'app-server-detail-chart',
    standalone: false,
    templateUrl: './server-detail-chart.component.html',
    styleUrls: ['./server-detail-chart.component.scss'],
})
export class ServerDetailChartComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public serverId: string | undefined;

    @Input() public uptimeHours = 0;

    public Highcharts: typeof Highcharts = Highcharts;

    public chartOptions: Highcharts.Options = {};

    private langSubscription!: Subscription;

    constructor(private translate: TranslateService) {}

    public ngOnInit(): void {
        this.generateChartData();
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.generateChartData();
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['serverId'] || changes['uptimeHours']) {
            this.generateChartData();
        }
    }

    public ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
    }

    private generateChartData(): void {
        const dataPoints: [number, number][] = [];
        const now = Date.now();
        const hoursToShow = Math.min(24, Math.max(1, Math.floor(this.uptimeHours)));

        for (let i = hoursToShow; i >= 0; i--) {
            const timestamp = now - (i * 60 * 60 * 1000);
            const baseUsage = 40 + (Math.sin(i / 3) * 15);
            const variation = (Math.random() - 0.5) * 20;
            const cpuUsage = Math.max(10, Math.min(90, baseUsage + variation));
            dataPoints.push([timestamp, Math.round(cpuUsage * 10) / 10]);
        }

        const cpuUsageLabel = this.translate.instant('CHART.CPU_USAGE_LABEL');
        const tooltipTemplate = this.translate.instant('CHART.CPU_USAGE_TOOLTIP', { value: '{y}' });

        this.chartOptions = {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: 300,
            },
            title: {
                text: this.translate.instant('CHART.CPU_USAGE_TITLE'),
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                },
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: this.translate.instant('CHART.TIME'),
                },
                labels: {
                    format: '{value:%H:%M}',
                },
            },
            yAxis: {
                title: {
                    text: this.translate.instant('CHART.CPU_USAGE_PERCENT'),
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
                    return `<b>${date.toLocaleString()}</b><br/>${tooltipTemplate.replace('{y}', String(this.y))}`;
                },
            },
            series: [
                {
                    name: cpuUsageLabel,
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
