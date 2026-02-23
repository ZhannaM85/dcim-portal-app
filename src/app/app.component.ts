import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption, NotificationService } from '@zhannam85/ui-kit';
import { ThemeService, ThemeName } from './services/theme.service';

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

    public themeOptions: DropdownOption[] = [];

    public currentLang: string;
    public currentTheme: ThemeName;

    constructor(
        private translate: TranslateService,
        private notificationService: NotificationService,
        private themeService: ThemeService,
    ) {
        this.translate.addLangs(['en', 'ru', 'de', 'fr', 'nl']);
        this.translate.setDefaultLang('en');

        const savedLang = localStorage.getItem('app-lang');
        this.currentLang = savedLang && this.translate.getLangs().includes(savedLang) ? savedLang : 'en';
        this.translate.use(this.currentLang);

        this.currentTheme = this.themeService.currentTheme;
        this.buildThemeOptions();

        this.translate.onLangChange.subscribe(() => {
            this.buildThemeOptions();
        });
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

    public switchTheme(theme: ThemeName): void {
        this.currentTheme = theme;
        this.themeService.setTheme(theme);
    }

    private buildThemeOptions(): void {
        this.themeOptions = [
            { label: this.translate.instant('THEME.LIGHT'), value: 'light' },
            { label: this.translate.instant('THEME.DARK'), value: 'dark' },
            { label: this.translate.instant('THEME.PINK'), value: 'pink' },
            { label: this.translate.instant('THEME.GREEN'), value: 'green' },
        ];
    }
}
