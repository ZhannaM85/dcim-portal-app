import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Server } from '../../models/server.model';
import { ServerService } from '../../services/server.service';

@Component({
    standalone: false,
    selector: 'app-server-detail',
    templateUrl: './server-detail.component.html',
    styleUrls: ['./server-detail.component.scss'],
})
export class ServerDetailComponent implements OnInit {
    server: Server | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private serverService: ServerService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.server = this.serverService.getById(id);
        }
        if (!this.server) {
            this.router.navigate(['/servers']);
        }
    }

    goBack(): void {
        this.router.navigate(['/servers']);
    }

    onRestart(): void {
        if (this.server) {
            this.server.status = 'running';
            this.server.uptimeHours = 0;
        }
    }

    onShutDown(): void {
        if (this.server) {
            this.server.status = 'stopped';
            this.server.uptimeHours = 0;
        }
    }

    formatUptime(hours: number): string {
        if (hours === 0) return 'Offline';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
}
