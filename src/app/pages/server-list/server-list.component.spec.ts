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
});
