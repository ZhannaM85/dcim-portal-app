import { Injectable } from '@angular/core';
import { Server, MOCK_SERVERS } from '../models/server.model';
import { generateServerId } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ServerService {
    private servers: Server[] = [...MOCK_SERVERS];

    public getAll(): Server[] {
        return [...this.servers];
    }

    public getById(id: string): Server | undefined {
        return this.servers.find((s) => s.id === id);
    }

    public deleteByIds(ids: string[]): void {
        this.servers = this.servers.filter((s) => !ids.includes(s.id));
    }

    public restoreServers(servers: Server[]): void {
        const existingIds = new Set(this.servers.map((s) => s.id));
        const toAdd = servers.filter((s) => {
            if (existingIds.has(s.id)) return false;
            existingIds.add(s.id);
            return true;
        });
        this.servers.push(...toAdd);
    }

    public create(serverData: Partial<Server>): Server {
        const newId = generateServerId(this.servers);

        const newServer: Server = {
            id: newId,
            hostname: serverData.hostname ?? '',
            ipAddress: serverData.ipAddress ?? '',
            status: serverData.status ?? 'stopped',
            location: serverData.location ?? 'DC-East',
            os: serverData.os ?? '',
            cpuCores: serverData.cpuCores ?? 4,
            ramGb: serverData.ramGb ?? 8,
            storageGb: serverData.storageGb ?? 100,
            uptimeHours: serverData.uptimeHours ?? 0,
        };

        this.servers.push(newServer);
        return newServer;
    }

    public update(id: string, updates: Partial<Server>): Server | undefined {
        const server = this.servers.find((s) => s.id === id);
        if (!server) {
            return undefined;
        }

        // Update only provided fields
        Object.assign(server, updates);
        return server;
    }
}
