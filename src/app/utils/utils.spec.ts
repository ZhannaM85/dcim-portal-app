import { FormControl, Validators } from '@angular/forms';
import {
    formatUptime,
    generateServerId,
    IP_ADDRESS_REGEX,
    getValidationErrorKey,
    filterServers,
    sortServers,
    escapeRegex,
    highlightText,
    generateCpuDataPoints,
} from './utils';
import { Server } from '../models/server.model';

// --- formatUptime ---

describe('formatUptime', () => {
    it('should return the offline label when hours is 0', () => {
        expect(formatUptime(0, 'Offline')).toBe('Offline');
    });

    it('should return hours-only format for less than 24 hours', () => {
        expect(formatUptime(5, 'Offline')).toBe('5h');
        expect(formatUptime(23, 'Offline')).toBe('23h');
    });

    it('should return days and hours for 24+ hours', () => {
        expect(formatUptime(24, 'Offline')).toBe('1d 0h');
        expect(formatUptime(25, 'Offline')).toBe('1d 1h');
        expect(formatUptime(49, 'Offline')).toBe('2d 1h');
    });

    it('should handle large values', () => {
        expect(formatUptime(2184, 'Offline')).toBe('91d 0h');
        expect(formatUptime(8760, 'Offline')).toBe('365d 0h');
    });

    it('should handle exactly 1 hour', () => {
        expect(formatUptime(1, 'Offline')).toBe('1h');
    });

    it('should use the provided offline label', () => {
        expect(formatUptime(0, 'Hors ligne')).toBe('Hors ligne');
        expect(formatUptime(0, 'Офлайн')).toBe('Офлайн');
    });
});

// --- generateServerId ---

describe('generateServerId', () => {
    it('should return srv-001 for an empty array', () => {
        expect(generateServerId([])).toBe('srv-001');
    });

    it('should return the next sequential ID', () => {
        const servers = [{ id: 'srv-001' }, { id: 'srv-002' }, { id: 'srv-003' }];
        expect(generateServerId(servers)).toBe('srv-004');
    });

    it('should handle gaps and use the max ID', () => {
        const servers = [{ id: 'srv-001' }, { id: 'srv-005' }];
        expect(generateServerId(servers)).toBe('srv-006');
    });

    it('should zero-pad the ID to 3 digits', () => {
        const servers = [{ id: 'srv-008' }];
        expect(generateServerId(servers)).toBe('srv-009');
    });

    it('should handle IDs beyond 3 digits', () => {
        const servers = [{ id: 'srv-999' }];
        expect(generateServerId(servers)).toBe('srv-1000');
    });

    it('should handle single server', () => {
        expect(generateServerId([{ id: 'srv-012' }])).toBe('srv-013');
    });

    it('should use the max ID when servers are in descending order', () => {
        const servers = [{ id: 'srv-010' }, { id: 'srv-003' }, { id: 'srv-007' }];
        expect(generateServerId(servers)).toBe('srv-011');
    });
});

// --- IP_ADDRESS_REGEX ---

describe('IP_ADDRESS_REGEX', () => {
    it('should match valid IP addresses', () => {
        expect(IP_ADDRESS_REGEX.test('192.168.1.1')).toBe(true);
        expect(IP_ADDRESS_REGEX.test('10.0.0.1')).toBe(true);
        expect(IP_ADDRESS_REGEX.test('255.255.255.255')).toBe(true);
        expect(IP_ADDRESS_REGEX.test('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
        expect(IP_ADDRESS_REGEX.test('256.1.1.1')).toBe(false);
        expect(IP_ADDRESS_REGEX.test('1.2.3')).toBe(false);
        expect(IP_ADDRESS_REGEX.test('abc.def.ghi.jkl')).toBe(false);
        expect(IP_ADDRESS_REGEX.test('')).toBe(false);
        expect(IP_ADDRESS_REGEX.test('1.2.3.4.5')).toBe(false);
    });
});

// --- getValidationErrorKey ---

describe('getValidationErrorKey', () => {
    it('should return null for null control', () => {
        expect(getValidationErrorKey(null, 'test')).toBeNull();
    });

    it('should return null for valid control', () => {
        const control = new FormControl('value', Validators.required);
        expect(getValidationErrorKey(control, 'field')).toBeNull();
    });

    it('should detect required error', () => {
        const control = new FormControl('', Validators.required);
        control.markAsTouched();
        const result = getValidationErrorKey(control, 'hostname');
        expect(result).toEqual({ key: 'COMMON.VALIDATION.REQUIRED', params: { field: 'hostname' } });
    });

    it('should detect minlength error', () => {
        const control = new FormControl('ab', Validators.minLength(3));
        control.markAsTouched();
        const result = getValidationErrorKey(control, 'hostname');
        expect(result).toEqual({
            key: 'COMMON.VALIDATION.MIN_LENGTH',
            params: { field: 'hostname', length: 3 },
        });
    });

    it('should detect pattern error', () => {
        const control = new FormControl('invalid', Validators.pattern(IP_ADDRESS_REGEX));
        control.markAsTouched();
        const result = getValidationErrorKey(control, 'ipAddress');
        expect(result).toEqual({ key: 'COMMON.VALIDATION.INVALID_IP' });
    });

    it('should detect min error', () => {
        const control = new FormControl(0, Validators.min(1));
        control.markAsTouched();
        const result = getValidationErrorKey(control, 'cpuCores');
        expect(result).toEqual({ key: 'COMMON.VALIDATION.MIN_VALUE', params: { min: 1 } });
    });

    it('should detect max error', () => {
        const control = new FormControl(300, Validators.max(256));
        control.markAsTouched();
        const result = getValidationErrorKey(control, 'cpuCores');
        expect(result).toEqual({ key: 'COMMON.VALIDATION.MAX_VALUE', params: { max: 256 } });
    });
});

// --- filterServers ---

const SERVERS: Server[] = [
    { id: 'srv-001', hostname: 'web-prod-01', ipAddress: '10.0.1.10', status: 'running', location: 'DC-East', os: 'Ubuntu 22.04 LTS', cpuCores: 16, ramGb: 64, storageGb: 500, uptimeHours: 2184 },
    { id: 'srv-002', hostname: 'db-master-01', ipAddress: '10.0.2.20', status: 'running', location: 'DC-West', os: 'Red Hat Enterprise Linux 9', cpuCores: 32, ramGb: 128, storageGb: 2000, uptimeHours: 4320 },
    { id: 'srv-003', hostname: 'cache-node-01', ipAddress: '10.0.3.30', status: 'stopped', location: 'DC-East', os: 'Debian 12', cpuCores: 8, ramGb: 32, storageGb: 100, uptimeHours: 0 },
    { id: 'srv-004', hostname: 'gateway-eu-01', ipAddress: '10.0.4.40', status: 'maintenance', location: 'DC-Europe', os: 'Alpine Linux 3.19', cpuCores: 4, ramGb: 8, storageGb: 50, uptimeHours: 0 },
];

describe('filterServers', () => {
    it('should return all servers when no filters applied', () => {
        const result = filterServers(SERVERS, {});
        expect(result.length).toBe(4);
    });

    it('should filter by status', () => {
        const result = filterServers(SERVERS, { status: 'running' });
        expect(result.length).toBe(2);
        expect(result.every(s => s.status === 'running')).toBe(true);
    });

    it('should filter by location', () => {
        const result = filterServers(SERVERS, { location: 'DC-East' });
        expect(result.length).toBe(2);
        expect(result.every(s => s.location === 'DC-East')).toBe(true);
    });

    it('should filter by search term (hostname)', () => {
        const result = filterServers(SERVERS, { searchTerm: 'web', searchType: 'hostname' });
        expect(result.length).toBe(1);
        expect(result[0].hostname).toBe('web-prod-01');
    });

    it('should filter by search term (os)', () => {
        const result = filterServers(SERVERS, { searchTerm: 'Ubuntu', searchType: 'os' });
        expect(result.length).toBe(1);
        expect(result[0].os).toContain('Ubuntu');
    });

    it('should not apply search filter when term is too short', () => {
        const result = filterServers(SERVERS, { searchTerm: 'we', searchType: 'hostname' });
        expect(result.length).toBe(4);
    });

    it('should combine multiple filters', () => {
        const result = filterServers(SERVERS, { status: 'running', location: 'DC-East' });
        expect(result.length).toBe(1);
        expect(result[0].hostname).toBe('web-prod-01');
    });

    it('should be case-insensitive for search', () => {
        const result = filterServers(SERVERS, { searchTerm: 'WEB', searchType: 'hostname' });
        expect(result.length).toBe(1);
    });
});

// --- sortServers ---

describe('sortServers', () => {
    it('should return unsorted when column is null', () => {
        const result = sortServers(SERVERS, null, 'asc');
        expect(result.map(s => s.id)).toEqual(['srv-001', 'srv-002', 'srv-003', 'srv-004']);
    });

    it('should sort by hostname ascending', () => {
        const result = sortServers(SERVERS, 'hostname', 'asc');
        expect(result[0].hostname).toBe('cache-node-01');
        expect(result[3].hostname).toBe('web-prod-01');
    });

    it('should sort by hostname descending', () => {
        const result = sortServers(SERVERS, 'hostname', 'desc');
        expect(result[0].hostname).toBe('web-prod-01');
        expect(result[3].hostname).toBe('cache-node-01');
    });

    it('should sort numeric columns numerically', () => {
        const result = sortServers(SERVERS, 'cpuCores', 'asc');
        expect(result.map(s => s.cpuCores)).toEqual([4, 8, 16, 32]);
    });

    it('should sort numeric columns descending', () => {
        const result = sortServers(SERVERS, 'ramGb', 'desc');
        expect(result.map(s => s.ramGb)).toEqual([128, 64, 32, 8]);
    });

    it('should not mutate the original array', () => {
        const original = [...SERVERS];
        sortServers(SERVERS, 'hostname', 'desc');
        expect(SERVERS.map(s => s.id)).toEqual(original.map(s => s.id));
    });
});

// --- escapeRegex ---

describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
        expect(escapeRegex('test.value')).toBe('test\\.value');
        expect(escapeRegex('a+b*c')).toBe('a\\+b\\*c');
        expect(escapeRegex('(foo)')).toBe('\\(foo\\)');
        expect(escapeRegex('[bar]')).toBe('\\[bar\\]');
    });

    it('should return the same string if no special characters', () => {
        expect(escapeRegex('hello')).toBe('hello');
    });
});

// --- highlightText ---

describe('highlightText', () => {
    it('should return original text when search is empty', () => {
        expect(highlightText('hello world', '')).toBe('hello world');
    });

    it('should return original text when search is too short', () => {
        expect(highlightText('hello world', 'he')).toBe('hello world');
    });

    it('should return original text when text is empty', () => {
        expect(highlightText('', 'hello')).toBe('');
    });

    it('should wrap matching text with mark tags', () => {
        expect(highlightText('hello world', 'hello')).toBe('<mark>hello</mark> world');
    });

    it('should be case-insensitive', () => {
        expect(highlightText('Hello World', 'hello')).toBe('<mark>Hello</mark> World');
    });

    it('should highlight all occurrences', () => {
        expect(highlightText('foo bar foo', 'foo')).toBe('<mark>foo</mark> bar <mark>foo</mark>');
    });

    it('should handle regex special characters in search', () => {
        expect(highlightText('price is $10.00', '$10')).toBe('price is <mark>$10</mark>.00');
    });

    it('should allow custom minimum length of 1', () => {
        expect(highlightText('abc', 'a', 1)).toBe('<mark>a</mark>bc');
    });

    it('should not highlight when search has no match', () => {
        expect(highlightText('hello world', 'xyz')).toBe('hello world');
    });
});

// --- generateCpuDataPoints ---

describe('generateCpuDataPoints', () => {
    const fixedNow = 1700000000000;

    it('should return data points array', () => {
        const result = generateCpuDataPoints(12, fixedNow);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should return hoursToShow + 1 data points', () => {
        expect(generateCpuDataPoints(12, fixedNow).length).toBe(13);
        expect(generateCpuDataPoints(1, fixedNow).length).toBe(2);
    });

    it('should cap at 24 hours', () => {
        expect(generateCpuDataPoints(100, fixedNow).length).toBe(25);
    });

    it('should use at least 1 hour', () => {
        expect(generateCpuDataPoints(0.5, fixedNow).length).toBe(2);
    });

    it('should have timestamps in ascending order', () => {
        const result = generateCpuDataPoints(10, fixedNow);
        for (let i = 1; i < result.length; i++) {
            expect(result[i][0]).toBeGreaterThan(result[i - 1][0]);
        }
    });

    it('should have the last timestamp equal to now', () => {
        const result = generateCpuDataPoints(5, fixedNow);
        expect(result[result.length - 1][0]).toBe(fixedNow);
    });

    it('should keep CPU values between 10 and 90', () => {
        const result = generateCpuDataPoints(24, fixedNow);
        for (const [, cpuUsage] of result) {
            expect(cpuUsage).toBeGreaterThanOrEqual(10);
            expect(cpuUsage).toBeLessThanOrEqual(90);
        }
    });

    it('should produce data points as [timestamp, value] tuples', () => {
        const result = generateCpuDataPoints(5, fixedNow);
        for (const point of result) {
            expect(point.length).toBe(2);
            expect(typeof point[0]).toBe('number');
            expect(typeof point[1]).toBe('number');
        }
    });
});
