import { TestBed } from '@angular/core/testing';
import { ServerService } from './server.service';
import { MOCK_SERVERS } from '../models/server.model';

describe('ServerService', () => {
    let service: ServerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ServerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAll', () => {
        it('should return all servers', () => {
            const servers = service.getAll();
            expect(servers.length).toBe(MOCK_SERVERS.length);
        });

        it('should return a copy (not the internal array)', () => {
            const a = service.getAll();
            const b = service.getAll();
            expect(a).not.toBe(b);
        });
    });

    describe('getById', () => {
        it('should return the server with matching ID', () => {
            const server = service.getById('srv-001');
            expect(server).toBeDefined();
            expect(server?.hostname).toBe('web-prod-01');
        });

        it('should return undefined for non-existent ID', () => {
            expect(service.getById('srv-999')).toBeUndefined();
        });
    });

    describe('create', () => {
        it('should add a new server and return it', () => {
            const before = service.getAll().length;
            const created = service.create({ hostname: 'new-server', ipAddress: '10.0.0.1', os: 'Ubuntu' });
            expect(service.getAll().length).toBe(before + 1);
            expect(created.hostname).toBe('new-server');
        });

        it('should generate a unique sequential ID', () => {
            const created = service.create({ hostname: 'test' });
            expect(created.id).toMatch(/^srv-\d{3,}$/);
            const num = parseInt(created.id.replace('srv-', ''), 10);
            expect(num).toBeGreaterThan(0);
        });

        it('should apply default values for missing fields', () => {
            const created = service.create({});
            expect(created.hostname).toBe('');
            expect(created.status).toBe('stopped');
            expect(created.cpuCores).toBe(4);
            expect(created.ramGb).toBe(8);
            expect(created.storageGb).toBe(100);
        });
    });

    describe('update', () => {
        it('should update the server with matching ID', () => {
            service.update('srv-001', { hostname: 'updated-host' });
            const updated = service.getById('srv-001');
            expect(updated?.hostname).toBe('updated-host');
        });

        it('should return the updated server', () => {
            const result = service.update('srv-001', { os: 'Debian 12' });
            expect(result?.os).toBe('Debian 12');
        });

        it('should return undefined for non-existent ID', () => {
            expect(service.update('srv-999', { hostname: 'x' })).toBeUndefined();
        });

        it('should only update provided fields', () => {
            const before = service.getById('srv-001');
            const oldIp = before?.ipAddress;
            service.update('srv-001', { hostname: 'changed' });
            const after = service.getById('srv-001');
            expect(after?.hostname).toBe('changed');
            expect(after?.ipAddress).toBe(oldIp);
        });
    });

    describe('deleteByIds', () => {
        it('should remove servers with given IDs', () => {
            const before = service.getAll().length;
            service.deleteByIds(['srv-001', 'srv-002']);
            expect(service.getAll().length).toBe(before - 2);
            expect(service.getById('srv-001')).toBeUndefined();
            expect(service.getById('srv-002')).toBeUndefined();
        });

        it('should ignore non-existent IDs', () => {
            const before = service.getAll().length;
            service.deleteByIds(['srv-999']);
            expect(service.getAll().length).toBe(before);
        });
    });

    describe('restoreServers', () => {
        it('should add servers back to the list', () => {
            const server = service.getById('srv-001')!;
            service.deleteByIds(['srv-001']);
            expect(service.getById('srv-001')).toBeUndefined();

            service.restoreServers([server]);
            expect(service.getById('srv-001')).toBeDefined();
        });
    });
});
