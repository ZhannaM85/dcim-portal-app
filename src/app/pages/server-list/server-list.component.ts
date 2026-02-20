import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption } from '@zhannam85/ui-kit';
import { Server } from '../../models/server.model';
import { ServerService } from '../../services/server.service';
import { AddServerDialogComponent } from './add-server-dialog/add-server-dialog.component';

type SortColumn = 'hostname' | 'ipAddress' | 'status' | 'location' | 'os' | 'cpuCores' | 'ramGb' | 'storageGb' | 'uptimeHours';
type SortDirection = 'asc' | 'desc';

const NUMERIC_COLUMNS: ReadonlySet<SortColumn> = new Set(['cpuCores', 'ramGb', 'storageGb', 'uptimeHours']);

const MIN_SEARCH_LENGTH = 3;

@Component({
    standalone: false,
    selector: 'app-server-list',
    templateUrl: './server-list.component.html',
    styleUrls: ['./server-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerListComponent implements OnInit, OnDestroy {
    public servers: Server[] = [];

    public filteredServers: Server[] = [];

    public selectedIds = new Set<string>();

    public sortColumn: SortColumn | null = 'hostname';

    public sortDirection: SortDirection = 'asc';

    public searchTerm = '';

    public selectedSearchType = 'hostname';

    public searchTypeOptions: DropdownOption[] = [];

    public statusOptions: DropdownOption[] = [];

    public locationOptions: DropdownOption[] = [];

    public selectedStatus = '';

    public selectedLocation = '';

    private searchSubject = new Subject<string>();

    private searchSubscription!: Subscription;

    private langSubscription!: Subscription;

    constructor(
        private serverService: ServerService,
        private router: Router,
        private dialog: Dialog,
        private cdr: ChangeDetectorRef,
        private translate: TranslateService
    ) {
        this.buildTranslatedOptions();
    }

    public ngOnInit(): void {
        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe((term) => {
            this.searchTerm = term;
            this.applyFilters();
            this.cdr.markForCheck();
        });

        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.buildTranslatedOptions();
            this.cdr.markForCheck();
        });

        this.loadServers();
    }

    public ngOnDestroy(): void {
        this.searchSubscription.unsubscribe();
        this.langSubscription.unsubscribe();
    }

    public loadServers(): void {
        this.servers = this.serverService.getAll();
        this.applyFilters();
    }

    public applyFilters(): void {
        const searchActive = this.searchTerm.length >= MIN_SEARCH_LENGTH;
        const term = this.searchTerm.toLowerCase();

        this.filteredServers = this.servers.filter((s) => {
            const matchesStatus =
                !this.selectedStatus || s.status === this.selectedStatus;
            const matchesLocation =
                !this.selectedLocation || s.location === this.selectedLocation;

            let matchesSearch = true;
            if (searchActive) {
                const field = this.selectedSearchType === 'os' ? s.os : s.hostname;
                matchesSearch = field.toLowerCase().includes(term);
            }

            return matchesStatus && matchesLocation && matchesSearch;
        });

        if (this.sortColumn) {
            const col = this.sortColumn;
            const dir = this.sortDirection === 'asc' ? 1 : -1;

            this.filteredServers.sort((a, b) => {
                const valA = a[col];
                const valB = b[col];

                if (NUMERIC_COLUMNS.has(col)) {
                    return ((valA as number) - (valB as number)) * dir;
                }
                return String(valA).localeCompare(String(valB)) * dir;
            });
        }

        const visibleIds = new Set(this.filteredServers.map((s) => s.id));
        this.selectedIds.forEach((id) => {
            if (!visibleIds.has(id)) {
                this.selectedIds.delete(id);
            }
        });
    }

    public onSearchInput(value: string): void {
        this.searchSubject.next(value);
    }

    public onSearchCleared(): void {
        this.searchTerm = '';
        this.applyFilters();
    }

    public onSearchTypeChange(value: string): void {
        this.selectedSearchType = value;
        if (this.searchTerm.length >= MIN_SEARCH_LENGTH) {
            this.applyFilters();
        }
    }

    public clearAllFilters(): void {
        this.searchTerm = '';
        this.selectedSearchType = 'hostname';
        this.selectedStatus = '';
        this.selectedLocation = '';
        this.applyFilters();
    }

    public get hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedStatus || this.selectedLocation);
    }

    public sort(column: SortColumn): void {
        if (this.sortColumn === column) {
            if (this.sortDirection === 'asc') {
                this.sortDirection = 'desc';
            } else {
                this.sortColumn = null;
                this.sortDirection = 'asc';
            }
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.applyFilters();
    }

    public onStatusFilterChange(value: string): void {
        this.selectedStatus = value;
        this.applyFilters();
    }

    public onLocationFilterChange(value: string): void {
        this.selectedLocation = value;
        this.applyFilters();
    }

    public get allSelected(): boolean {
        return (
            this.filteredServers.length > 0 &&
            this.filteredServers.every((s) => this.selectedIds.has(s.id))
        );
    }

    public get someSelected(): boolean {
        return (
            this.selectedIds.size > 0 &&
            !this.allSelected
        );
    }

    public get hasSelection(): boolean {
        return this.selectedIds.size > 0;
    }

    public toggleSelectAll(checked: boolean): void {
        if (checked) {
            this.filteredServers.forEach((s) => this.selectedIds.add(s.id));
        } else {
            this.selectedIds.clear();
        }
    }

    public toggleServerSelection(serverId: string, checked: boolean): void {
        if (checked) {
            this.selectedIds.add(serverId);
        } else {
            this.selectedIds.delete(serverId);
        }
    }

    public isSelected(serverId: string): boolean {
        return this.selectedIds.has(serverId);
    }

    public navigateToDetail(serverId: string): void {
        this.router.navigate(['/servers', serverId]);
    }

    public onDeleteSelected(): void {
        const ids = Array.from(this.selectedIds);
        this.serverService.deleteByIds(ids);
        this.selectedIds.clear();
        this.loadServers();
    }

    public onRestartSelected(): void {
        // Mock restart: just toggle status to running
        this.selectedIds.forEach((id) => {
            const server = this.servers.find((s) => s.id === id);
            if (server) {
                server.status = 'running';
                server.uptimeHours = 0;
            }
        });
        this.selectedIds.clear();
    }

    public formatUptime(hours: number): string {
        if (hours === 0) return this.translate.instant('COMMON.OFFLINE');
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }

    private buildTranslatedOptions(): void {
        this.searchTypeOptions = [
            { label: this.translate.instant('SERVER_LIST.SEARCH_TYPE.HOSTNAME'), value: 'hostname' },
            { label: this.translate.instant('SERVER_LIST.SEARCH_TYPE.OS'), value: 'os' },
        ];
        this.statusOptions = [
            { label: this.translate.instant('SERVER_LIST.ALL_STATUSES'), value: '' },
            { label: this.translate.instant('COMMON.STATUSES.RUNNING'), value: 'running' },
            { label: this.translate.instant('COMMON.STATUSES.STOPPED'), value: 'stopped' },
            { label: this.translate.instant('COMMON.STATUSES.MAINTENANCE'), value: 'maintenance' },
        ];
        this.locationOptions = [
            { label: this.translate.instant('SERVER_LIST.ALL_LOCATIONS'), value: '' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EAST'), value: 'DC-East' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_WEST'), value: 'DC-West' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EUROPE'), value: 'DC-Europe' },
        ];
    }

    public onAddServer(): void {
        const dialogRef = this.dialog.open<Server>(AddServerDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            hasBackdrop: true,
            backdropClass: 'cdk-dialog-backdrop',
            panelClass: 'add-server-dialog-panel',
        });

        dialogRef.closed.subscribe((result) => {
            if (result) {
                // Server was created, refresh the list
                this.loadServers();
                this.cdr.detectChanges();
            }
        });
    }
}
