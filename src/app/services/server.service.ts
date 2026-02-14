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
}
