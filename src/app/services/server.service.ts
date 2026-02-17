import { Injectable } from '@angular/core';
import { Server, MOCK_SERVERS } from '../models/server.model';

@Injectable({
    providedIn: 'root',
})
export class ServerService {
    private servers: Server[] = [...MOCK_SERVERS];

    getAll(): Server[] {
        return [...this.servers];
    }

    getById(id: string): Server | undefined {
        return this.servers.find((s) => s.id === id);
    }

    deleteByIds(ids: string[]): void {
        this.servers = this.servers.filter((s) => !ids.includes(s.id));
    }

    create(serverData: Partial<Server>): Server {
        // Generate unique ID
        const maxId = this.servers.reduce((max, s) => {
            const num = parseInt(s.id.replace('srv-', ''), 10);
            return num > max ? num : max;
        }, 0);
        const newId = `srv-${String(maxId + 1).padStart(3, '0')}`;

        const newServer: Server = {
            id: newId,
            hostname: serverData.hostname || '',
            ipAddress: serverData.ipAddress || '',
            status: serverData.status || 'stopped',
            location: serverData.location || 'DC-East',
            os: serverData.os || '',
            cpuCores: serverData.cpuCores || 4,
            ramGb: serverData.ramGb || 8,
            storageGb: serverData.storageGb || 100,
            uptimeHours: serverData.uptimeHours || 0,
        };

        this.servers.push(newServer);
        return newServer;
    }

    update(id: string, updates: Partial<Server>): Server | undefined {
        const server = this.servers.find((s) => s.id === id);
        if (!server) {
            return undefined;
        }

        // Update only provided fields
        Object.assign(server, updates);
        return server;
    }
}
