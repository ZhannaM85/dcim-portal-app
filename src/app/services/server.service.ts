import { Injectable } from '@angular/core';
import { Server, MOCK_SERVERS } from '../models/server.model';
import { generateServerId } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ServerService {
    private servers: Server[] = [...MOCK_SERVERS];

    /**
     * Returns a defensive copy of all servers.
     */
    public getAll(): Server[] {
        return [...this.servers];
    }

    /**
     * Finds a server by its unique identifier.
     *
     * @param id Server identifier.
     * @returns Matching server or `undefined` if not found.
     */
    public getById(id: string): Server | undefined {
        return this.servers.find((s) => s.id === id);
    }

    /**
     * Deletes servers whose ids are included in the provided list.
     *
     * @param ids Server identifiers to delete.
     */
    public deleteByIds(ids: string[]): void {
        this.servers = this.servers.filter((s) => !ids.includes(s.id));
    }

    /**
     * Restores previously deleted servers while preventing duplicate ids.
     *
     * @param servers Servers to restore.
     */
    public restoreServers(servers: Server[]): void {
        const existingIds = new Set(this.servers.map((s) => s.id));
        const toAdd = servers.filter((s) => {
            if (existingIds.has(s.id)) return false;
            existingIds.add(s.id);
            return true;
        });
        this.servers.push(...toAdd);
    }

    /**
     * Creates a new server using provided values and safe defaults.
     *
     * @param serverData Partial server payload from form input.
     * @returns Newly created server.
     */
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

    /**
     * Updates an existing server with partial fields.
     *
     * @param id Server identifier to update.
     * @param updates Fields to update.
     * @returns Updated server or `undefined` when no server exists.
     */
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
