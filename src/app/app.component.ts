import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption, NotificationService } from '@zhannam85/ui-kit';

@Component({
    standalone: false,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public languageOptions: DropdownOption[] = [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Français', value: 'fr' },
        { label: 'Nederlands', value: 'nl' },
    ];

    public currentLang: string;

    constructor(
        private translate: TranslateService,
        private notificationService: NotificationService,
    ) {
        this.translate.addLangs(['en', 'ru', 'de', 'fr', 'nl']);
        this.translate.setDefaultLang('en');

        const savedLang = localStorage.getItem('app-lang');
        this.currentLang = savedLang && this.translate.getLangs().includes(savedLang) ? savedLang : 'en';
        this.translate.use(this.currentLang);
    }

    public switchLanguage(lang: string): void {
        this.currentLang = lang;
        this.translate.use(lang).subscribe(() => {
            this.notificationService.success(
                this.translate.instant('NOTIFICATIONS.LANGUAGE_CHANGED')
            );
        });
        localStorage.setItem('app-lang', lang);
    }
}
