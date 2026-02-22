import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption, NotificationService } from '@zhannam85/ui-kit';
import { Server } from '../../models/server.model';
import { ServerService } from '../../services/server.service';
import { AddServerDialogComponent } from './add-server-dialog/add-server-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';
import { filterServers, sortServers, SortColumn, SortDirection, formatUptime } from '../../utils/utils';

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
        private translate: TranslateService,
        private notificationService: NotificationService,
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
        const filtered = filterServers(this.servers, {
            status: this.selectedStatus,
            location: this.selectedLocation,
            searchTerm: this.searchTerm,
            searchType: this.selectedSearchType,
        });

        this.filteredServers = sortServers(filtered, this.sortColumn, this.sortDirection);

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
        const count = ids.length;
        const deletedServers = this.servers.filter((s) => ids.includes(s.id));

        const data: ConfirmDialogData = {
            title: this.translate.instant('CONFIRM_DELETE.TITLE'),
            message: this.translate.instant('CONFIRM_DELETE.MESSAGE', { count }),
            confirmLabel: this.translate.instant('CONFIRM_DELETE.CONFIRM'),
            cancelLabel: this.translate.instant('COMMON.CANCEL'),
        };

        const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
            width: '460px',
            maxWidth: '90vw',
            hasBackdrop: true,
            backdropClass: 'cdk-dialog-backdrop',
            panelClass: 'confirm-dialog-panel',
            data,
        });

        dialogRef.closed.subscribe((confirmed) => {
            if (confirmed) {
                this.serverService.deleteByIds(ids);
                this.selectedIds.clear();
                this.loadServers();
                this.cdr.detectChanges();
                this.notificationService.warning(
                    this.translate.instant('NOTIFICATIONS.SERVERS_DELETED', { count }),
                    {
                        actionLabel: this.translate.instant('NOTIFICATIONS.UNDO'),
                        actionCallback: () => {
                            this.serverService.restoreServers(deletedServers);
                            this.loadServers();
                            this.cdr.detectChanges();
                            this.notificationService.success(
                                this.translate.instant('NOTIFICATIONS.SERVERS_RESTORED', { count })
                            );
                        },
                    }
                );
            }
        });
    }

    public onRestartSelected(): void {
        const count = this.selectedIds.size;
        this.selectedIds.forEach((id) => {
            const server = this.servers.find((s) => s.id === id);
            if (server) {
                server.status = 'running';
                server.uptimeHours = 0;
            }
        });
        this.selectedIds.clear();
        this.notificationService.success(
            this.translate.instant('NOTIFICATIONS.SERVERS_RESTARTED', { count })
        );
    }

    public formatUptime(hours: number): string {
        return formatUptime(hours, this.translate.instant('COMMON.OFFLINE'));
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
                this.loadServers();
                this.cdr.detectChanges();
                this.notificationService.success(
                    this.translate.instant('NOTIFICATIONS.SERVER_ADDED', { hostname: result.hostname })
                );
            }
        });
    }
}
