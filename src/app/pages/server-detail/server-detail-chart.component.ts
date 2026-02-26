import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as Highcharts from 'highcharts';
import { generateCpuDataPoints } from '../../utils/utils';
import { ThemeService } from '../../services/theme.service';

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

    public updateFlag = false;

    private langSubscription!: Subscription;
    private themeObserver!: MutationObserver;

    /**
     * Initializes chart dependencies.
     */
    constructor(
        private translate: TranslateService,
        private themeService: ThemeService,
    ) {}

    /**
     * Generates initial chart and subscribes to language/theme changes.
     */
    public ngOnInit(): void {
        this.generateChartData();
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.generateChartData();
        });

        this.themeObserver = new MutationObserver(() => {
            this.generateChartData();
        });
        this.themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });
    }

    /**
     * Refreshes chart data when relevant inputs change.
     *
     * @param changes Angular input change map.
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['serverId'] || changes['uptimeHours']) {
            this.generateChartData();
        }
    }

    /**
     * Cleans up subscriptions and observers.
     */
    public ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
        this.themeObserver.disconnect();
    }

    /**
     * Reads active CSS theme tokens used by chart styling.
     *
     * @returns Chart color palette derived from CSS variables.
     */
    private getThemeColors(): { text: string; textSecondary: string; border: string; primary: string; primaryRgb: string } {
        const style = getComputedStyle(document.body);
        return {
            text: style.getPropertyValue('--color-text').trim() || '#1e293b',
            textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#64748b',
            border: style.getPropertyValue('--color-border').trim() || '#e2e8f0',
            primary: style.getPropertyValue('--color-primary').trim() || '#4a90e2',
            primaryRgb: style.getPropertyValue('--kit-color-primary-rgb').trim() || '74, 144, 226',
        };
    }

    /**
     * Rebuilds chart configuration and toggles Highcharts update flag.
     */
    private generateChartData(): void {
        const dataPoints = generateCpuDataPoints(this.uptimeHours);
        const colors = this.getThemeColors();

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
                    color: colors.text,
                },
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: this.translate.instant('CHART.TIME'),
                    style: { color: colors.textSecondary },
                },
                labels: {
                    format: '{value:%H:%M}',
                    style: { color: colors.textSecondary },
                },
                lineColor: colors.border,
                tickColor: colors.border,
                gridLineColor: colors.border,
            },
            yAxis: {
                title: {
                    text: this.translate.instant('CHART.CPU_USAGE_PERCENT'),
                    style: { color: colors.textSecondary },
                },
                min: 0,
                max: 100,
                labels: {
                    format: '{value}%',
                    style: { color: colors.textSecondary },
                },
                gridLineColor: colors.border,
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
                    color: colors.primary,
                    lineWidth: 2,
                    marker: {
                        enabled: false,
                        radius: 3,
                    },
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, `rgba(${colors.primaryRgb}, 0.3)`],
                            [1, `rgba(${colors.primaryRgb}, 0.05)`],
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
        this.updateFlag = true;
        setTimeout(() => this.updateFlag = false);
    }
}
