import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ServerDetailChartComponent } from './server-detail-chart.component';

@Component({ selector: 'highcharts-chart', template: '', standalone: false })
class MockHighchartsChart {
    @Input() Highcharts: unknown;
    @Input() options: unknown;
}

describe('ServerDetailChartComponent', () => {
    let component: ServerDetailChartComponent;
    let fixture: ComponentFixture<ServerDetailChartComponent>;
    let langChangeSubject: Subject<unknown>;

    beforeEach(async () => {
        langChangeSubject = new Subject();

        await TestBed.configureTestingModule({
            declarations: [ServerDetailChartComponent, MockHighchartsChart],
            providers: [
                {
                    provide: TranslateService,
                    useValue: {
                        instant: jest.fn((key: string) => key),
                        onLangChange: langChangeSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ServerDetailChartComponent);
        component = fixture.componentInstance;
        component.uptimeHours = 12;
        component.serverId = 'srv-001';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should generate chart options on init', () => {
        expect(component.chartOptions).toBeDefined();
        expect(component.chartOptions.series).toBeDefined();
    });

    it('should have area chart type', () => {
        expect(component.chartOptions.chart?.type).toBe('area');
    });

    it('should regenerate chart data when uptimeHours changes', () => {
        const oldOptions = component.chartOptions;
        component.uptimeHours = 24;
        component.ngOnChanges({
            uptimeHours: {
                currentValue: 24,
                previousValue: 12,
                firstChange: false,
                isFirstChange: () => false,
            },
        });
        expect(component.chartOptions).not.toBe(oldOptions);
    });

    it('should regenerate chart data on language change', () => {
        const oldOptions = component.chartOptions;
        langChangeSubject.next({ lang: 'de' });
        expect(component.chartOptions).not.toBe(oldOptions);
    });
});
