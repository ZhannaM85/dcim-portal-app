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
    /**
     * Initializes confirmation dialog with injected payload.
     *
     * @param dialogRef Dialog reference used to return the result.
     * @param data Dialog labels and content.
     */
    constructor(
        private dialogRef: DialogRef<boolean>,
        @Inject(DIALOG_DATA) public data: ConfirmDialogData,
    ) {}

    /**
     * Closes the dialog and confirms the action.
     */
    public onConfirm(): void {
        this.dialogRef.close(true);
    }

    /**
     * Closes the dialog and cancels the action.
     */
    public onCancel(): void {
        this.dialogRef.close(false);
    }
}
