import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownOption } from '@zhannam85/ui-kit';
import { Server } from '../../models/server.model';
import { ServerService } from '../../services/server.service';

@Component({
    standalone: false,
    selector: 'app-server-list',
    templateUrl: './server-list.component.html',
    styleUrls: ['./server-list.component.scss'],
})
export class ServerListComponent implements OnInit {
    servers: Server[] = [];
    filteredServers: Server[] = [];
    selectedIds: Set<string> = new Set();

    statusOptions: DropdownOption[] = [
        { label: 'All Statuses', value: '' },
        { label: 'Running', value: 'running' },
        { label: 'Stopped', value: 'stopped' },
        { label: 'Maintenance', value: 'maintenance' },
    ];

    locationOptions: DropdownOption[] = [
        { label: 'All Locations', value: '' },
        { label: 'DC-East', value: 'DC-East' },
        { label: 'DC-West', value: 'DC-West' },
        { label: 'DC-Europe', value: 'DC-Europe' },
    ];

    selectedStatus = '';
    selectedLocation = '';

    constructor(
        private serverService: ServerService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadServers();
    }

    loadServers(): void {
        this.servers = this.serverService.getAll();
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredServers = this.servers.filter((s) => {
            const matchesStatus =
                !this.selectedStatus || s.status === this.selectedStatus;
            const matchesLocation =
                !this.selectedLocation || s.location === this.selectedLocation;
            return matchesStatus && matchesLocation;
        });
        // Remove selections that are no longer visible
        const visibleIds = new Set(this.filteredServers.map((s) => s.id));
        this.selectedIds.forEach((id) => {
            if (!visibleIds.has(id)) {
                this.selectedIds.delete(id);
            }
        });
    }

    onStatusFilterChange(value: string): void {
        this.selectedStatus = value;
        this.applyFilters();
    }

    onLocationFilterChange(value: string): void {
        this.selectedLocation = value;
        this.applyFilters();
    }

    get allSelected(): boolean {
        return (
            this.filteredServers.length > 0 &&
            this.filteredServers.every((s) => this.selectedIds.has(s.id))
        );
    }

    get someSelected(): boolean {
        return (
            this.selectedIds.size > 0 &&
            !this.allSelected
        );
    }

    get hasSelection(): boolean {
        return this.selectedIds.size > 0;
    }

    toggleSelectAll(checked: boolean): void {
        if (checked) {
            this.filteredServers.forEach((s) => this.selectedIds.add(s.id));
        } else {
            this.selectedIds.clear();
        }
    }

    toggleServerSelection(serverId: string, checked: boolean): void {
        if (checked) {
            this.selectedIds.add(serverId);
        } else {
            this.selectedIds.delete(serverId);
        }
    }

    isSelected(serverId: string): boolean {
        return this.selectedIds.has(serverId);
    }

    navigateToDetail(serverId: string): void {
        this.router.navigate(['/servers', serverId]);
    }

    onDeleteSelected(): void {
        const ids = Array.from(this.selectedIds);
        this.serverService.deleteByIds(ids);
        this.selectedIds.clear();
        this.loadServers();
    }

    onRestartSelected(): void {
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

    formatUptime(hours: number): string {
        if (hours === 0) return 'Offline';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
}
