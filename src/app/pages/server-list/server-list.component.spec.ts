import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Pipe, PipeTransform, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@zhannam85/ui-kit';
import { of, Subject } from 'rxjs';
import { ServerListComponent } from './server-list.component';
import { ServerService } from '../../services/server.service';
import { Server, MOCK_SERVERS } from '../../models/server.model';

@Component({ selector: 'kit-button', template: '', standalone: false })
class MockButtonComponent {
    @Input() label = '';

    @Input() variant = '';

    @Input() size = '';

    @Input() disabled = false;

    @Output() buttonClicked = new EventEmitter();
}

@Component({ selector: 'kit-checkbox', template: '', standalone: false })
class MockCheckboxComponent {
    @Input() checked = false;

    @Input() indeterminate = false;

    @Input() disabled = false;

    @Output() checkedChange = new EventEmitter();
}

@Component({ selector: 'kit-dropdown', template: '', standalone: false })
class MockDropdownComponent {
    @Input() options: unknown;

    @Input() selectedValue: unknown;

    @Input() placeholder = '';

    @Input() disabled = false;

    @Output() selectionChange = new EventEmitter();
}

@Component({ selector: 'kit-input', template: '', standalone: false })
class MockInputComponent {
    @Input() placeholder = '';

    @Input() clearable = false;

    @Output() valueChange = new EventEmitter();

    @Output() cleared = new EventEmitter();
}

@Component({ selector: 'kit-icon-sort-asc', template: '', standalone: false })
class MockSortAsc { @Input() size: unknown; }
@Component({ selector: 'kit-icon-sort-desc', template: '', standalone: false })
class MockSortDesc { @Input() size: unknown; }

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
    transform(value: string): string { return value; }
}

@Pipe({ name: 'highlight', standalone: false })
class MockHighlightPipe implements PipeTransform {
    transform(value: string): string { return value; }
}

describe('ServerListComponent', () => {
    let component: ServerListComponent;
    let fixture: ComponentFixture<ServerListComponent>;
    let mockServerService: Partial<ServerService>;
    let mockRouter: Partial<Router>;
    let mockDialog: Partial<Dialog>;
    let langChangeSubject: Subject<unknown>;

    beforeEach(async () => {
        langChangeSubject = new Subject();
        mockServerService = {
            getAll: jest.fn().mockReturnValue([...MOCK_SERVERS]),
            deleteByIds: jest.fn(),
            restoreServers: jest.fn(),
        };
        mockRouter = { navigate: jest.fn() };
        mockDialog = { open: jest.fn().mockReturnValue({ closed: of(null) }) };

        const mockTranslate = {
            instant: jest.fn((key: string) => key),
            get: jest.fn((key: string) => of(key)),
            onLangChange: langChangeSubject.asObservable(),
            onTranslationChange: new Subject(),
            onDefaultLangChange: new Subject(),
        };

        await TestBed.configureTestingModule({
            declarations: [
                ServerListComponent,
                MockButtonComponent,
                MockCheckboxComponent,
                MockDropdownComponent,
                MockInputComponent,
                MockSortAsc,
                MockSortDesc,
                MockTranslatePipe,
                MockHighlightPipe,
            ],
            imports: [CommonModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: ServerService, useValue: mockServerService },
                { provide: Router, useValue: mockRouter },
                { provide: Dialog, useValue: mockDialog },
                { provide: TranslateService, useValue: mockTranslate },
                { provide: NotificationService, useValue: { success: jest.fn(), warning: jest.fn() } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ServerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load servers on init', () => {
        expect(component.servers.length).toBe(MOCK_SERVERS.length);
        expect(component.filteredServers.length).toBeGreaterThan(0);
    });

    it('should filter by status', () => {
        component.selectedStatus = 'running';
        component.applyFilters();
        expect(component.filteredServers.every(s => s.status === 'running')).toBe(true);
    });

    it('should filter by location', () => {
        component.selectedLocation = 'DC-East';
        component.applyFilters();
        expect(component.filteredServers.every(s => s.location === 'DC-East')).toBe(true);
    });

    it('should sort by hostname', () => {
        const hostnames = component.filteredServers.map(s => s.hostname);
        const sorted = [...hostnames].sort();
        expect(hostnames).toEqual(sorted);
    });

    it('should toggle sort direction', () => {
        expect(component.sortDirection).toBe('asc');

        component.sort('hostname');
        expect(component.sortDirection).toBe('desc');
    });

    it('should clear sort on third click', () => {
        component.sort('hostname');
        component.sort('hostname');
        expect(component.sortColumn).toBeNull();
    });

    it('should toggle server selection', () => {
        component.toggleServerSelection('srv-001', true);
        expect(component.isSelected('srv-001')).toBe(true);

        component.toggleServerSelection('srv-001', false);
        expect(component.isSelected('srv-001')).toBe(false);
    });

    it('should select all visible servers', () => {
        component.toggleSelectAll(true);
        expect(component.selectedIds.size).toBe(component.filteredServers.length);
    });

    it('should deselect all', () => {
        component.toggleSelectAll(true);
        component.toggleSelectAll(false);
        expect(component.selectedIds.size).toBe(0);
    });

    it('should navigate to detail', () => {
        component.navigateToDetail('srv-001');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/servers', 'srv-001']);
    });

    it('should clear all filters', () => {
        component.searchTerm = 'test';
        component.selectedStatus = 'running';
        component.selectedLocation = 'DC-East';
        component.clearAllFilters();
        expect(component.searchTerm).toBe('');
        expect(component.selectedStatus).toBe('');
        expect(component.selectedLocation).toBe('');
    });

    it('should report hasActiveFilters', () => {
        expect(component.hasActiveFilters).toBe(false);
        component.selectedStatus = 'running';
        expect(component.hasActiveFilters).toBe(true);
    });

    it('should format uptime using extracted utility', () => {
        expect(component.formatUptime(0)).toBe('COMMON.OFFLINE');
        expect(component.formatUptime(25)).toBe('1d 1h');
    });

    it('should debounce search input', fakeAsync(() => {
        component.onSearchInput('web');
        expect(component.searchTerm).toBe('');

        tick(300);
        expect(component.searchTerm).toBe('web');
    }));

    it('should clear search term and reapply filters', () => {
        component.searchTerm = 'something';
        component.onSearchCleared();
        expect(component.searchTerm).toBe('');
    });

    it('should change search type and reapply when search is long enough', () => {
        component.searchTerm = 'web-prod';
        component.onSearchTypeChange('os');
        expect(component.selectedSearchType).toBe('os');
    });

    it('should change search type without reapply when search is too short', () => {
        component.searchTerm = 'ab';
        const before = [...component.filteredServers];
        component.onSearchTypeChange('os');
        expect(component.selectedSearchType).toBe('os');
        expect(component.filteredServers.length).toBe(before.length);
    });

    it('should rebuild translated options on language change', () => {
        const initialOptions = [...component.statusOptions];
        langChangeSubject.next({ lang: 'de' });
        expect(component.statusOptions).toBeDefined();
        expect(component.locationOptions).toBeDefined();
        expect(component.searchTypeOptions).toBeDefined();
    });

    it('should sort a different column resetting direction to asc', () => {
        component.sort('hostname');
        expect(component.sortDirection).toBe('desc');

        component.sort('cpuCores');
        expect(component.sortColumn).toBe('cpuCores');
        expect(component.sortDirection).toBe('asc');
    });

    it('should apply status filter via onStatusFilterChange', () => {
        component.onStatusFilterChange('stopped');
        expect(component.selectedStatus).toBe('stopped');
        expect(component.filteredServers.every(s => s.status === 'stopped')).toBe(true);
    });

    it('should apply location filter via onLocationFilterChange', () => {
        component.onLocationFilterChange('DC-West');
        expect(component.selectedLocation).toBe('DC-West');
        expect(component.filteredServers.every(s => s.location === 'DC-West')).toBe(true);
    });

    it('should prune selected IDs when filtering hides them', () => {
        component.toggleServerSelection('srv-001', true);
        expect(component.isSelected('srv-001')).toBe(true);

        component.onStatusFilterChange('stopped');
        const srv001Visible = component.filteredServers.some(s => s.id === 'srv-001');
        if (!srv001Visible) {
            expect(component.isSelected('srv-001')).toBe(false);
        }
    });

    it('should report allSelected correctly', () => {
        expect(component.allSelected).toBe(false);

        component.toggleSelectAll(true);
        expect(component.allSelected).toBe(true);
    });

    it('should report someSelected correctly', () => {
        expect(component.someSelected).toBe(false);

        component.toggleServerSelection('srv-001', true);
        expect(component.someSelected).toBe(true);

        component.toggleSelectAll(true);
        expect(component.someSelected).toBe(false);
    });

    it('should report hasSelection correctly', () => {
        expect(component.hasSelection).toBe(false);

        component.toggleServerSelection('srv-001', true);
        expect(component.hasSelection).toBe(true);
    });

    it('should delete selected servers when confirmed', () => {
        const closedSubject = new Subject<boolean>();
        (mockDialog.open as jest.Mock).mockReturnValue({ closed: closedSubject.asObservable() });

        component.toggleServerSelection('srv-001', true);
        component.toggleServerSelection('srv-002', true);
        component.onDeleteSelected();

        expect(mockDialog.open).toHaveBeenCalled();

        closedSubject.next(true);
        closedSubject.complete();

        expect(mockServerService.deleteByIds).toHaveBeenCalledWith(['srv-001', 'srv-002']);
        expect(component.selectedIds.size).toBe(0);
    });

    it('should not delete when dialog is cancelled', () => {
        const closedSubject = new Subject<boolean>();
        (mockDialog.open as jest.Mock).mockReturnValue({ closed: closedSubject.asObservable() });

        component.toggleServerSelection('srv-001', true);
        component.onDeleteSelected();

        closedSubject.next(false);
        closedSubject.complete();

        expect(mockServerService.deleteByIds).not.toHaveBeenCalled();
    });

    it('should invoke undo callback to restore deleted servers', () => {
        const closedSubject = new Subject<boolean>();
        (mockDialog.open as jest.Mock).mockReturnValue({ closed: closedSubject.asObservable() });
        const mockNotification = TestBed.inject(NotificationService);

        component.toggleServerSelection('srv-001', true);
        component.onDeleteSelected();
        closedSubject.next(true);
        closedSubject.complete();

        const warningCall = (mockNotification.warning as jest.Mock).mock.calls[0];
        const options = warningCall[1];
        expect(options.actionLabel).toBeTruthy();

        options.actionCallback();
        expect(mockServerService.restoreServers).toHaveBeenCalled();
        expect(mockNotification.success).toHaveBeenCalled();
    });

    it('should restart selected servers', () => {
        const mockNotification = TestBed.inject(NotificationService);
        component.toggleServerSelection('srv-001', true);
        component.toggleServerSelection('srv-002', true);

        component.onRestartSelected();

        expect(component.selectedIds.size).toBe(0);
        expect(mockNotification.success).toHaveBeenCalled();
        const srv = component.servers.find(s => s.id === 'srv-001');
        expect(srv?.status).toBe('running');
        expect(srv?.uptimeHours).toBe(0);
    });

    it('should skip non-existent servers during restart', () => {
        component.selectedIds.add('srv-nonexistent');
        component.onRestartSelected();
        expect(component.selectedIds.size).toBe(0);
    });

    it('should open add server dialog and reload on result', () => {
        const closedSubject = new Subject<Server | null>();
        (mockDialog.open as jest.Mock).mockReturnValue({ closed: closedSubject.asObservable() });
        const mockNotification = TestBed.inject(NotificationService);

        component.onAddServer();
        expect(mockDialog.open).toHaveBeenCalled();

        closedSubject.next({ id: 'srv-new', hostname: 'new-host', ipAddress: '10.0.0.1', status: 'stopped', location: 'DC-East', os: 'Ubuntu', cpuCores: 4, ramGb: 8, storageGb: 100, uptimeHours: 0 } as Server);
        closedSubject.complete();

        expect(mockServerService.getAll).toHaveBeenCalled();
        expect(mockNotification.success).toHaveBeenCalled();
    });

    it('should not reload when add server dialog is dismissed', () => {
        const closedSubject = new Subject<Server | null>();
        (mockDialog.open as jest.Mock).mockReturnValue({ closed: closedSubject.asObservable() });
        const callsBefore = (mockServerService.getAll as jest.Mock).mock.calls.length;

        component.onAddServer();
        closedSubject.next(null);
        closedSubject.complete();

        expect((mockServerService.getAll as jest.Mock).mock.calls.length).toBe(callsBefore);
    });

    it('should unsubscribe on destroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
