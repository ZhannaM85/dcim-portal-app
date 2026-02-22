import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({ selector: 'kit-button', template: '', standalone: false })
class MockButton { @Input() label = ''; @Input() variant = ''; @Output() buttonClicked = new EventEmitter(); }

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let mockDialogRef: Partial<DialogRef<boolean>>;

    const dialogData: ConfirmDialogData = {
        title: 'Confirm Delete',
        message: 'Are you sure?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
    };

    beforeEach(async () => {
        mockDialogRef = { close: jest.fn() };

        await TestBed.configureTestingModule({
            declarations: [ConfirmDialogComponent, MockButton],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: DIALOG_DATA, useValue: dialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the injected dialog data', () => {
        expect(component.data.title).toBe('Confirm Delete');
        expect(component.data.message).toBe('Are you sure?');
    });

    it('should close with true on confirm', () => {
        component.onConfirm();
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should close with false on cancel', () => {
        component.onCancel();
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
});
