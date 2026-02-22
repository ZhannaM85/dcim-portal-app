import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption } from '@zhannam85/ui-kit';
import { ServerService } from '../../../services/server.service';
import { Server, ServerLocation, ServerStatus } from '../../../models/server.model';
import { IP_ADDRESS_REGEX, getValidationErrorKey } from '../../../utils/utils';

@Component({
    selector: 'app-add-server-dialog',
    standalone: false,
    templateUrl: './add-server-dialog.component.html',
    styleUrls: ['./add-server-dialog.component.scss'],
})
export class AddServerDialogComponent {
    public serverForm: FormGroup;

    public locationOptions: DropdownOption[] = [];

    public statusOptions: DropdownOption[] = [];

    private ipRegex = IP_ADDRESS_REGEX;

    constructor(
        private fb: FormBuilder,
        private dialogRef: DialogRef<Server>,
        private serverService: ServerService,
        private translate: TranslateService
    ) {
        this.buildTranslatedOptions();
        this.serverForm = this.fb.group({
            hostname: ['', [Validators.required, Validators.minLength(3)]],
            ipAddress: ['', [Validators.required, Validators.pattern(this.ipRegex)]],
            location: ['DC-East', Validators.required],
            os: ['', Validators.required],
            status: ['stopped', Validators.required],
            cpuCores: [4, [Validators.required, Validators.min(1), Validators.max(256)]],
            ramGb: [8, [Validators.required, Validators.min(1), Validators.max(1024)]],
            storageGb: [100, [Validators.required, Validators.min(1), Validators.max(100000)]],
        });
    }

    public get hostname() {
        return this.serverForm.get('hostname');
    }

    public get ipAddress() {
        return this.serverForm.get('ipAddress');
    }

    public get location() {
        return this.serverForm.get('location');
    }

    public get os() {
        return this.serverForm.get('os');
    }

    public get status() {
        return this.serverForm.get('status');
    }

    public get cpuCores() {
        return this.serverForm.get('cpuCores');
    }

    public get ramGb() {
        return this.serverForm.get('ramGb');
    }

    public get storageGb() {
        return this.serverForm.get('storageGb');
    }

    public onSubmit(): void {
        if (this.serverForm.valid) {
            const formValue = this.serverForm.value;
            const newServer = this.serverService.create({
                hostname: formValue.hostname,
                ipAddress: formValue.ipAddress,
                location: formValue.location as ServerLocation,
                os: formValue.os,
                status: formValue.status as ServerStatus,
                cpuCores: parseInt(formValue.cpuCores, 10),
                ramGb: parseInt(formValue.ramGb, 10),
                storageGb: parseInt(formValue.storageGb, 10),
                uptimeHours: 0,
            });
            this.dialogRef.close(newServer);
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.serverForm.controls).forEach((key) => {
                this.serverForm.get(key)?.markAsTouched();
            });
        }
    }

    public onCancel(): void {
        this.dialogRef.close();
    }

    public getErrorMessage(fieldName: string): string {
        const control = this.serverForm.get(fieldName);
        const error = getValidationErrorKey(control ?? null, fieldName);
        return error ? this.translate.instant(error.key, error.params) : '';
    }

    private buildTranslatedOptions(): void {
        this.locationOptions = [
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EAST'), value: 'DC-East' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_WEST'), value: 'DC-West' },
            { label: this.translate.instant('COMMON.LOCATIONS.DC_EUROPE'), value: 'DC-Europe' },
        ];
        this.statusOptions = [
            { label: this.translate.instant('COMMON.STATUSES.RUNNING'), value: 'running' },
            { label: this.translate.instant('COMMON.STATUSES.STOPPED'), value: 'stopped' },
            { label: this.translate.instant('COMMON.STATUSES.MAINTENANCE'), value: 'maintenance' },
        ];
    }
}
