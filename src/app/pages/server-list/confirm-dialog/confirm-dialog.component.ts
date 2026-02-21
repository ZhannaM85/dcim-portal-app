import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: false,
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
    constructor(
        private dialogRef: DialogRef<boolean>,
        @Inject(DIALOG_DATA) public data: ConfirmDialogData,
    ) {}

    public onConfirm(): void {
        this.dialogRef.close(true);
    }

    public onCancel(): void {
        this.dialogRef.close(false);
    }
}
