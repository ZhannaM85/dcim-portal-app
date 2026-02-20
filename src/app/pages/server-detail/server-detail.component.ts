import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Server, ServerLocation } from '../../models/server.model';
import { ServerService } from '../../services/server.service';
import { DropdownOption } from '@zhannam85/ui-kit';

@Component({
    standalone: false,
    selector: 'app-server-detail',
    templateUrl: './server-detail.component.html',
    styleUrls: ['./server-detail.component.scss'],
})
export class ServerDetailComponent implements OnInit, OnDestroy {
    public server: Server | undefined;

    public isEditMode = false;

    public serverForm: FormGroup;

    public locationOptions: DropdownOption[] = [];

    private ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    private langSubscription!: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private serverService: ServerService,
        private fb: FormBuilder,
        private translate: TranslateService
    ) {
        this.buildTranslatedOptions();
        this.serverForm = this.fb.group({
            hostname: ['', [Validators.required, Validators.minLength(3)]],
            ipAddress: ['', [Validators.required, Validators.pattern(this.ipRegex)]],
            location: ['DC-East', Validators.required],
            os: ['', Validators.required],
            cpuCores: [4, [Validators.required, Validators.min(1), Validators.max(256)]],
            ramGb: [8, [Validators.required, Validators.min(1), Validators.max(1024)]],
            storageGb: [100, [Validators.required, Validators.min(1), Validators.max(100000)]],
        });
    }

    public ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.server = this.serverService.getById(id);
            if (this.server) {
                this.initializeForm();
            }
        }
        if (!this.server) {
            this.router.navigate(['/servers']);
        }

        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.buildTranslatedOptions();
        });
    }

    public ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
    }

    private initializeForm(): void {
        if (this.server) {
            this.serverForm.patchValue({
                hostname: this.server.hostname,
                ipAddress: this.server.ipAddress,
                location: this.server.location,
                os: this.server.os,
                cpuCores: this.server.cpuCores,
                ramGb: this.server.ramGb,
                storageGb: this.server.storageGb,
            });
        }
    }

    public goBack(): void {
        this.router.navigate(['/servers']);
    }

    public onRestart(): void {
        if (this.server) {
            this.server.status = 'running';
            this.server.uptimeHours = 0;
        }
    }

    public onShutDown(): void {
        if (this.server) {
            this.server.status = 'stopped';
            this.server.uptimeHours = 0;
        }
    }

    public formatUptime(hours: number): string {
        if (hours === 0) return this.translate.instant('COMMON.OFFLINE');
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }

    public toggleEditMode(): void {
        this.isEditMode = !this.isEditMode;
        if (this.isEditMode) {
            this.initializeForm();
        }
    }

    public saveChanges(): void {
        if (this.serverForm.valid && this.server) {
            const formValue = this.serverForm.value;
            this.serverService.update(this.server.id, {
                hostname: formValue.hostname,
                ipAddress: formValue.ipAddress,
                location: formValue.location as ServerLocation,
                os: formValue.os,
                cpuCores: parseInt(formValue.cpuCores, 10),
                ramGb: parseInt(formValue.ramGb, 10),
                storageGb: parseInt(formValue.storageGb, 10),
            });
            // Reload server to get updated data
            this.server = this.serverService.getById(this.server.id);
            this.isEditMode = false;
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.serverForm.controls).forEach((key) => {
                this.serverForm.get(key)?.markAsTouched();
            });
        }
    }

    public cancelEdit(): void {
        this.isEditMode = false;
        this.initializeForm();
    }

    public getErrorMessage(fieldName: string): string {
        const control = this.serverForm.get(fieldName);
        if (control?.hasError('required')) {
            return this.translate.instant('COMMON.VALIDATION.REQUIRED', { field: fieldName });
        }
        if (control?.hasError('minlength')) {
            return this.translate.instant('COMMON.VALIDATION.MIN_LENGTH', {
                field: fieldName,
                length: control.errors?.['minlength'].requiredLength,
            });
        }
        if (control?.hasError('pattern')) {
            return this.translate.instant('COMMON.VALIDATION.INVALID_IP');
        }
        if (control?.hasError('min')) {
            return this.translate.instant('COMMON.VALIDATION.MIN_VALUE', { min: control.errors?.['min'].min });
        }
        if (control?.hasError('max')) {
            return this.translate.instant('COMMON.VALIDATION.MAX_VALUE', { max: control.errors?.['max'].max });
        }
        return '';
    }

    private buildTranslatedOptions(): void {
        this.locationOptions = [
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EAST'), value: 'DC-East' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_WEST'), value: 'DC-West' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EUROPE'), value: 'DC-Europe' },
        ];
    }
}
