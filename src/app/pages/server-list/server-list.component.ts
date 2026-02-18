import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { DropdownOption } from '@zhannam85/ui-kit';
import { Server } from '../../models/server.model';
import { ServerService } from '../../services/server.service';
import { AddServerDialogComponent } from './add-server-dialog/add-server-dialog.component';

type SortColumn = 'hostname' | 'ipAddress' | 'status' | 'location' | 'os' | 'cpuCores' | 'ramGb' | 'storageGb' | 'uptimeHours';
type SortDirection = 'asc' | 'desc';

const NUMERIC_COLUMNS: ReadonlySet<SortColumn> = new Set(['cpuCores', 'ramGb', 'storageGb', 'uptimeHours']);

@Component({
    standalone: false,
    selector: 'app-server-list',
    templateUrl: './server-list.component.html',
    styleUrls: ['./server-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerListComponent implements OnInit {
    public servers: Server[] = [];

    public filteredServers: Server[] = [];

    public selectedIds = new Set<string>();

    public sortColumn: SortColumn | null = null;

    public sortDirection: SortDirection = 'asc';

    public statusOptions: DropdownOption[] = [
        { label: 'All Statuses', value: '' },
        { label: 'Running', value: 'running' },
        { label: 'Stopped', value: 'stopped' },
        { label: 'Maintenance', value: 'maintenance' },
    ];

    public locationOptions: DropdownOption[] = [
        { label: 'All Locations', value: '' },
        { label: 'DC-East', value: 'DC-East' },
        { label: 'DC-West', value: 'DC-West' },
        { label: 'DC-Europe', value: 'DC-Europe' },
    ];

    public selectedStatus = '';

    public selectedLocation = '';

    constructor(
        private serverService: ServerService,
        private router: Router,
        private dialog: Dialog,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnInit(): void {
        this.loadServers();
    }

    public loadServers(): void {
        this.servers = this.serverService.getAll();
        this.applyFilters();
    }

    public applyFilters(): void {
        this.filteredServers = this.servers.filter((s) => {
            const matchesStatus =
                !this.selectedStatus || s.status === this.selectedStatus;
            const matchesLocation =
                !this.selectedLocation || s.location === this.selectedLocation;
            return matchesStatus && matchesLocation;
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
        if (hours === 0) return 'Offline';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
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
