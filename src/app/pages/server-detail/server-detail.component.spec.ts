/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/component-selector */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Pipe, PipeTransform, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@zhannam85/ui-kit';
import { ServerDetailComponent } from './server-detail.component';
import { ServerService } from '../../services/server.service';
import { Server } from '../../models/server.model';

@Component({ selector: 'kit-button', template: '', standalone: false })
class MockButton {
    @Input() public label = '';

    @Input() public variant = '';

    @Input() public size = '';

    @Input() public disabled = false;

    @Output() public buttonClicked = new EventEmitter();
}

@Component({
    selector: 'kit-input', template: '', standalone: false,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MockInput), multi: true }]
})
class MockInput implements ControlValueAccessor {
    @Input() public label = '';

    @Input() public placeholder = '';

    @Input() public type = '';

    @Input() public error = '';

    @Input() public required = false;

    @Output() public valueChange = new EventEmitter();

    public writeValue(): void {}

    public registerOnChange(): void {}

    public registerOnTouched(): void {}
}

@Component({ selector: 'kit-dropdown', template: '', standalone: false })
class MockDropdown {
    @Input() public options: unknown;

    @Input() public selectedValue: unknown;

    @Input() public placeholder = '';

    @Output() public selectionChange = new EventEmitter();
}

@Component({ selector: 'app-server-detail-chart', template: '', standalone: false })
class MockChart {
    @Input() public serverId: unknown;

    @Input() public uptimeHours = 0;
}

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
    public transform(value: string): string { return value; }
}

const MOCK_SERVER: Server = {
    id: 'srv-001', hostname: 'web-prod-01', ipAddress: '10.0.1.10',
    status: 'running', location: 'DC-East', os: 'Ubuntu 22.04 LTS',
    cpuCores: 16, ramGb: 64, storageGb: 500, uptimeHours: 2184,
};

describe('ServerDetailComponent', () => {
    let component: ServerDetailComponent;
    let fixture: ComponentFixture<ServerDetailComponent>;
    let mockServerService: Partial<ServerService>;
    let mockRouter: Partial<Router>;
    let mockNotification: Partial<NotificationService>;
    let langChangeSubject: Subject<unknown>;

    beforeEach(async () => {
        langChangeSubject = new Subject();
        mockServerService = {
            getById: jest.fn().mockReturnValue({ ...MOCK_SERVER }),
            update: jest.fn().mockReturnValue({ ...MOCK_SERVER }),
        };
        mockRouter = { navigate: jest.fn() };
        mockNotification = { success: jest.fn(), warning: jest.fn() };

        await TestBed.configureTestingModule({
            declarations: [ServerDetailComponent, MockButton, MockInput, MockDropdown, MockChart, MockTranslatePipe],
            imports: [CommonModule, ReactiveFormsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: ServerService, useValue: mockServerService },
                { provide: Router, useValue: mockRouter },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: convertToParamMap({ id: 'srv-001' }) } },
                },
                { provide: TranslateService, useValue: { instant: jest.fn((key: string) => key), get: jest.fn((key: string) => of(key)), onLangChange: langChangeSubject.asObservable(), onTranslationChange: new Subject(), onDefaultLangChange: new Subject() } },
                { provide: NotificationService, useValue: mockNotification },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ServerDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load server on init', () => {
        expect(component.server).toBeDefined();
        expect(component.server?.hostname).toBe('web-prod-01');
    });

    it('should navigate back to list if server not found', () => {
        (mockServerService.getById as jest.Mock).mockReturnValue(undefined);
        const newFixture = TestBed.createComponent(ServerDetailComponent);
        newFixture.detectChanges();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/servers']);
    });

    it('should navigate to servers list when route id is missing', async () => {
        TestBed.resetTestingModule();
        const localLangSubject = new Subject();
        await TestBed.configureTestingModule({
            declarations: [ServerDetailComponent, MockButton, MockInput, MockDropdown, MockChart, MockTranslatePipe],
            imports: [CommonModule, ReactiveFormsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: ServerService, useValue: mockServerService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
                { provide: TranslateService, useValue: { instant: jest.fn((key: string) => key), get: jest.fn((key: string) => of(key)), onLangChange: localLangSubject.asObservable(), onTranslationChange: new Subject(), onDefaultLangChange: new Subject() } },
                { provide: NotificationService, useValue: mockNotification },
            ],
        }).compileComponents();

        (mockServerService.getById as jest.Mock).mockClear();
        const newFixture = TestBed.createComponent(ServerDetailComponent);
        newFixture.detectChanges();
        expect(mockServerService.getById).not.toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/servers']);
    });

    it('should toggle edit mode', () => {
        expect(component.isEditMode).toBe(false);
        component.toggleEditMode();
        expect(component.isEditMode).toBe(true);
    });

    it('should initialize form with server data when entering edit mode', () => {
        component.toggleEditMode();
        expect(component.serverForm.get('hostname')?.value).toBe('web-prod-01');
        expect(component.serverForm.get('ipAddress')?.value).toBe('10.0.1.10');
        expect(component.serverForm.get('os')?.value).toBe('Ubuntu 22.04 LTS');
    });

    it('should save changes when form is valid', () => {
        component.toggleEditMode();
        component.serverForm.patchValue({ hostname: 'updated' });
        component.saveChanges();
        expect(mockServerService.update).toHaveBeenCalled();
        expect(component.isEditMode).toBe(false);
        expect(mockNotification.success).toHaveBeenCalled();
    });

    it('should not save when form is invalid and mark fields touched', () => {
        component.toggleEditMode();
        component.serverForm.patchValue({ hostname: '' });
        component.saveChanges();
        expect(mockServerService.update).not.toHaveBeenCalled();
        expect(component.serverForm.get('hostname')?.touched).toBe(true);
    });

    it('should cancel edit and restore form', () => {
        component.toggleEditMode();
        component.serverForm.patchValue({ hostname: 'changed' });
        component.cancelEdit();
        expect(component.isEditMode).toBe(false);
    });

    it('should format uptime', () => {
        expect(component.formatUptime(0)).toBe('COMMON.OFFLINE');
        expect(component.formatUptime(48)).toBe('2d 0h');
    });

    it('should return error message for invalid fields', () => {
        component.serverForm.get('hostname')?.setValue('');
        component.serverForm.get('hostname')?.markAsTouched();
        const msg = component.getErrorMessage('hostname');
        expect(msg).toBeTruthy();
    });

    it('should return empty string for valid fields', () => {
        component.serverForm.get('hostname')?.setValue('valid-host');
        const msg = component.getErrorMessage('hostname');
        expect(msg).toBe('');
    });

    it('should go back to server list', () => {
        component.goBack();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/servers']);
    });

    it('should rebuild translated options on language change', () => {
        langChangeSubject.next({ lang: 'de' });
        expect(component.locationOptions).toBeDefined();
        expect(component.locationOptions.length).toBeGreaterThan(0);
    });

    it('should restart the server', () => {
        component.onRestart();
        expect(component.server?.status).toBe('running');
        expect(component.server?.uptimeHours).toBe(0);
        expect(mockNotification.success).toHaveBeenCalled();
    });

    it('should shut down the server', () => {
        component.onShutDown();
        expect(component.server?.status).toBe('stopped');
        expect(component.server?.uptimeHours).toBe(0);
        expect(mockNotification.warning).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should not restart when server is undefined', () => {
        component.server = undefined;
        component.onRestart();
        expect(mockNotification.success).not.toHaveBeenCalled();
    });

    it('should not shut down when server is undefined', () => {
        component.server = undefined;
        component.onShutDown();
        expect(mockNotification.warning).not.toHaveBeenCalled();
    });

    it('should not patch form when server is undefined', () => {
        component.server = undefined;
        const spy = jest.spyOn(component.serverForm, 'patchValue');
        component.toggleEditMode();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle edit mode off without calling initializeForm', () => {
        component.toggleEditMode();
        expect(component.isEditMode).toBe(true);
        component.toggleEditMode();
        expect(component.isEditMode).toBe(false);
    });

    it('should return empty string for non-existent form field', () => {
        const msg = component.getErrorMessage('nonExistentField');
        expect(msg).toBe('');
    });

    it('should not save when form is valid but server is undefined', () => {
        component.toggleEditMode();
        component.serverForm.patchValue({
            hostname: 'valid-host',
            ipAddress: '10.0.0.1',
            location: 'DC-East',
            os: 'Ubuntu',
            cpuCores: 4,
            ramGb: 8,
            storageGb: 100,
        });
        component.server = undefined;
        component.saveChanges();
        expect(mockServerService.update).not.toHaveBeenCalled();
    });
});
