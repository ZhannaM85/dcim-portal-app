import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Server, ServerLocation } from '../../models/server.model';
import { ServerService } from '../../services/server.service';
import { DropdownOption, NotificationService } from '@zhannam85/ui-kit';
import { IP_ADDRESS_REGEX, getValidationErrorKey, formatUptime } from '../../utils/utils';

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

    private ipRegex = IP_ADDRESS_REGEX;

    private langSubscription!: Subscription;

    /**
     * Initializes detail page state and edit form.
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private serverService: ServerService,
        private fb: FormBuilder,
        private translate: TranslateService,
        private notificationService: NotificationService,
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

    /**
     * Loads selected server and sets up translation updates.
     */
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

    /**
     * Cleans up translation subscriptions.
     */
    public ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
    }

    /**
     * Initializes form controls from currently loaded server values.
     */
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

    /**
     * Navigates back to the servers list page.
     */
    public goBack(): void {
        this.router.navigate(['/servers']);
    }

    /**
     * Sets server status to running and resets uptime.
     */
    public onRestart(): void {
        if (this.server) {
            this.server.status = 'running';
            this.server.uptimeHours = 0;
            this.notificationService.success(
                this.translate.instant('NOTIFICATIONS.SERVER_RESTARTED', { hostname: this.server.hostname })
            );
        }
    }

    /**
     * Sets server status to stopped and resets uptime.
     */
    public onShutDown(): void {
        if (this.server) {
            this.server.status = 'stopped';
            this.server.uptimeHours = 0;
            this.notificationService.warning(
                this.translate.instant('NOTIFICATIONS.SERVER_SHUT_DOWN', { hostname: this.server.hostname })
            );
        }
    }

    /**
     * Formats uptime label using shared utility and translated offline text.
     *
     * @param hours Uptime in hours.
     * @returns Human-readable uptime text.
     */
    public formatUptime(hours: number): string {
        return formatUptime(hours, this.translate.instant('COMMON.OFFLINE'));
    }

    /**
     * Toggles edit mode and re-syncs form when entering edit state.
     */
    public toggleEditMode(): void {
        this.isEditMode = !this.isEditMode;
        if (this.isEditMode) {
            this.initializeForm();
        }
    }

    /**
     * Persists form updates for the current server when valid.
     */
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
            this.server = this.serverService.getById(this.server.id);
            this.isEditMode = false;
            this.notificationService.success(
                this.translate.instant('NOTIFICATIONS.SERVER_UPDATED', { hostname: this.server?.hostname })
            );
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.serverForm.controls).forEach((key) => {
                this.serverForm.get(key)?.markAsTouched();
            });
        }
    }

    /**
     * Exits edit mode and restores form values from server data.
     */
    public cancelEdit(): void {
        this.isEditMode = false;
        this.initializeForm();
    }

    /**
     * Returns translated validation message for a form field.
     *
     * @param fieldName Form control name.
     * @returns Localized validation message.
     */
    public getErrorMessage(fieldName: string): string {
        const control = this.serverForm.get(fieldName);
        const error = getValidationErrorKey(control ?? null, fieldName);
        return error ? this.translate.instant(error.key, error.params) : '';
    }

    /**
     * Rebuilds translated location options for the form dropdown.
     */
    private buildTranslatedOptions(): void {
        this.locationOptions = [
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EAST'), value: 'DC-East' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_WEST'), value: 'DC-West' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EUROPE'), value: 'DC-Europe' },
        ];
    }
}
