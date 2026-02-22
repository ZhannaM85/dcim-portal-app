import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@zhannam85/ui-kit';

@Component({ selector: 'kit-dropdown', template: '', standalone: false })
class MockDropdownComponent {
    @Input() options: unknown;
    @Input() selectedValue: unknown;
    @Output() selectionChange = new EventEmitter();
}

@Component({ selector: 'kit-notification-container', template: '', standalone: false })
class MockNotificationContainerComponent {}

@Component({ selector: 'router-outlet', template: '', standalone: false })
class MockRouterOutlet {}

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockTranslate: Partial<TranslateService>;
    let mockNotificationService: Partial<NotificationService>;

    beforeEach(async () => {
        mockTranslate = {
            addLangs: jest.fn(),
            setDefaultLang: jest.fn(),
            getLangs: jest.fn().mockReturnValue(['en', 'ru', 'de', 'fr', 'nl']),
            use: jest.fn().mockReturnValue(of({})),
            instant: jest.fn((key: string) => key),
        };
        mockNotificationService = {
            success: jest.fn(),
        };

        await TestBed.configureTestingModule({
            declarations: [AppComponent, MockDropdownComponent, MockNotificationContainerComponent, MockRouterOutlet],
            providers: [
                { provide: TranslateService, useValue: mockTranslate },
                { provide: NotificationService, useValue: mockNotificationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have language options', () => {
        expect(component.languageOptions.length).toBe(5);
    });

    it('should set default language to en', () => {
        expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en');
    });

    it('should switch language', () => {
        component.switchLanguage('de');
        expect(mockTranslate.use).toHaveBeenCalledWith('de');
        expect(component.currentLang).toBe('de');
    });

    it('should show notification on language switch', () => {
        component.switchLanguage('fr');
        expect(mockNotificationService.success).toHaveBeenCalled();
    });
});
