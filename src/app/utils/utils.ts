import { AbstractControl } from '@angular/forms';
import { Server } from '../models/server.model';

// --- Uptime formatting ---

export function formatUptime(hours: number, offlineLabel: string): string {
    if (hours === 0) return offlineLabel;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
}

// --- Server ID generation ---

export function generateServerId(existingServers: { id: string }[]): string {
    const maxId = existingServers.reduce((max, s) => {
        const num = parseInt(s.id.replace('srv-', ''), 10);
        return num > max ? num : max;
    }, 0);
    return `srv-${String(maxId + 1).padStart(3, '0')}`;
}

// --- Validation ---

export const IP_ADDRESS_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export interface ValidationError {
    key: string;
    params?: Record<string, unknown>;
}

export function getValidationErrorKey(control: AbstractControl | null, fieldName: string): ValidationError | null {
    if (!control) return null;

    if (control.hasError('required')) {
        return { key: 'COMMON.VALIDATION.REQUIRED', params: { field: fieldName } };
    }
    if (control.hasError('minlength')) {
        return {
            key: 'COMMON.VALIDATION.MIN_LENGTH',
            params: { field: fieldName, length: control.errors?.['minlength'].requiredLength },
        };
    }
    if (control.hasError('pattern')) {
        return { key: 'COMMON.VALIDATION.INVALID_IP' };
    }
    if (control.hasError('min')) {
        return { key: 'COMMON.VALIDATION.MIN_VALUE', params: { min: control.errors?.['min'].min } };
    }
    if (control.hasError('max')) {
        return { key: 'COMMON.VALIDATION.MAX_VALUE', params: { max: control.errors?.['max'].max } };
    }
    return null;
}

// --- Server filtering and sorting ---

export type SortColumn = 'hostname' | 'ipAddress' | 'status' | 'location' | 'os' | 'cpuCores' | 'ramGb' | 'storageGb' | 'uptimeHours';
export type SortDirection = 'asc' | 'desc';

const NUMERIC_COLUMNS: ReadonlySet<SortColumn> = new Set(['cpuCores', 'ramGb', 'storageGb', 'uptimeHours']);

const MIN_SEARCH_LENGTH = 3;

export interface ServerFilterCriteria {
    status?: string;
    location?: string;
    searchTerm?: string;
    searchType?: string;
}

export function filterServers(servers: Server[], filters: ServerFilterCriteria): Server[] {
    const searchActive = (filters.searchTerm?.length ?? 0) >= MIN_SEARCH_LENGTH;
    const term = (filters.searchTerm ?? '').toLowerCase();

    return servers.filter((s) => {
        const matchesStatus = !filters.status || s.status === filters.status;
        const matchesLocation = !filters.location || s.location === filters.location;

        let matchesSearch = true;
        if (searchActive) {
            const field = filters.searchType === 'os' ? s.os : s.hostname;
            matchesSearch = field.toLowerCase().includes(term);
        }

        return matchesStatus && matchesLocation && matchesSearch;
    });
}

export function sortServers(servers: Server[], column: SortColumn | null, direction: SortDirection): Server[] {
    if (!column) return servers;

    const dir = direction === 'asc' ? 1 : -1;
    return [...servers].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        if (NUMERIC_COLUMNS.has(column)) {
            return ((valA as number) - (valB as number)) * dir;
        }
        return String(valA).localeCompare(String(valB)) * dir;
    });
}

// --- Highlight / regex ---

export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightText(text: string, search: string, minLength = 3): string {
    if (!search || search.length < minLength || !text) {
        return text;
    }

    const escaped = escapeRegex(search);
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// --- Chart data generation ---

export function generateCpuDataPoints(uptimeHours: number, now = Date.now()): [number, number][] {
    const dataPoints: [number, number][] = [];
    const hoursToShow = Math.min(24, Math.max(1, Math.floor(uptimeHours)));

    for (let i = hoursToShow; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000);
        const baseUsage = 40 + (Math.sin(i / 3) * 15);
        const variation = (Math.random() - 0.5) * 20;
        const cpuUsage = Math.max(10, Math.min(90, baseUsage + variation));
        dataPoints.push([timestamp, Math.round(cpuUsage * 10) / 10]);
    }

    return dataPoints;
}
