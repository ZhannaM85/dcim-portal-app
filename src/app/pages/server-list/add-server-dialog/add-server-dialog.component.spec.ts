import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AddServerDialogComponent } from './add-server-dialog.component';
import { ServerService } from '../../../services/server.service';

@Component({ selector: 'kit-button', template: '', standalone: false })
class MockButton { @Input() label = ''; @Input() variant = ''; @Input() type = ''; @Input() disabled = false; @Output() buttonClicked = new EventEmitter(); }

@Component({ selector: 'kit-input', template: '', standalone: false })
class MockInput { @Input() label = ''; @Input() placeholder = ''; @Input() type = ''; @Input() error = ''; @Input() required = false; @Output() valueChange = new EventEmitter(); }

@Component({ selector: 'kit-dropdown', template: '', standalone: false })
class MockDropdown { @Input() options: unknown; @Input() selectedValue: unknown; @Input() placeholder = ''; @Output() selectionChange = new EventEmitter(); }

describe('AddServerDialogComponent', () => {
    let component: AddServerDialogComponent;
    let fixture: ComponentFixture<AddServerDialogComponent>;
    let mockDialogRef: Partial<DialogRef<unknown>>;
    let mockServerService: Partial<ServerService>;

    beforeEach(async () => {
        mockDialogRef = { close: jest.fn() };
        mockServerService = {
            create: jest.fn().mockReturnValue({
                id: 'srv-013', hostname: 'new-server', ipAddress: '10.0.0.1',
                status: 'stopped', location: 'DC-East', os: 'Ubuntu',
                cpuCores: 4, ramGb: 8, storageGb: 100, uptimeHours: 0,
            }),
        };

        await TestBed.configureTestingModule({
            declarations: [AddServerDialogComponent, MockButton, MockInput, MockDropdown],
            imports: [CommonModule, ReactiveFormsModule],
            providers: [
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: ServerService, useValue: mockServerService },
                { provide: TranslateService, useValue: { instant: jest.fn((key: string) => key) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddServerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have an invalid form by default', () => {
        expect(component.serverForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
        expect(component.hostname?.hasError('required')).toBe(true);
        expect(component.os?.hasError('required')).toBe(true);
    });

    it('should validate hostname minimum length', () => {
        component.serverForm.patchValue({ hostname: 'ab' });
        expect(component.hostname?.hasError('minlength')).toBe(true);
    });

    it('should validate IP address pattern', () => {
        component.serverForm.patchValue({ ipAddress: 'invalid' });
        expect(component.ipAddress?.hasError('pattern')).toBe(true);
    });

    it('should accept valid IP address', () => {
        component.serverForm.patchValue({ ipAddress: '192.168.1.1' });
        expect(component.ipAddress?.hasError('pattern')).toBe(false);
    });

    it('should validate cpuCores range', () => {
        component.serverForm.patchValue({ cpuCores: 0 });
        expect(component.cpuCores?.hasError('min')).toBe(true);

        component.serverForm.patchValue({ cpuCores: 300 });
        expect(component.cpuCores?.hasError('max')).toBe(true);
    });

    it('should not submit when form is invalid', () => {
        component.onSubmit();
        expect(mockServerService.create).not.toHaveBeenCalled();
    });

    it('should submit valid form and close dialog', () => {
        component.serverForm.patchValue({
            hostname: 'test-server',
            ipAddress: '10.0.0.1',
            location: 'DC-East',
            os: 'Ubuntu',
            status: 'stopped',
            cpuCores: 4,
            ramGb: 8,
            storageGb: 100,
        });
        component.onSubmit();
        expect(mockServerService.create).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close dialog on cancel', () => {
        component.onCancel();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should return error messages via getErrorMessage', () => {
        component.serverForm.get('hostname')?.markAsTouched();
        const msg = component.getErrorMessage('hostname');
        expect(msg).toBeTruthy();
    });
});
