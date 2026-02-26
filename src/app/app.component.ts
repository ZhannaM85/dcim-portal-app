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
    /**
     * Available UI languages shown in the language selector.
     */
    public languageOptions: DropdownOption[] = [
        { label: 'English', value: 'en' },
        { label: 'Русский', value: 'ru' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Français', value: 'fr' },
        { label: 'Nederlands', value: 'nl' },
    ];

    /**
     * Localized theme options for the theme selector.
     */
    public themeOptions: DropdownOption[] = [];

    /**
     * Currently active language code.
     */
    public currentLang: string;

    /**
     * Currently active application theme.
     */
    public currentTheme: ThemeName;

    /**
     * Initializes translation settings and restores persisted language/theme state.
     */
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

    /**
     * Switches the active application language and persists it in local storage.
     *
     * @param lang Target language code.
     */
    public switchLanguage(lang: string): void {
        this.currentLang = lang;
        this.translate.use(lang).subscribe(() => {
            this.notificationService.success(
                this.translate.instant('NOTIFICATIONS.LANGUAGE_CHANGED')
            );
        });
        localStorage.setItem('app-lang', lang);
    }

    /**
     * Applies the selected theme across the application.
     *
     * @param theme Theme identifier to apply.
     */
    public switchTheme(theme: ThemeName): void {
        this.currentTheme = theme;
        this.themeService.setTheme(theme);
    }

    /**
     * Rebuilds localized theme dropdown options based on current language.
     */
    private buildThemeOptions(): void {
        this.themeOptions = [
            { label: this.translate.instant('THEME.LIGHT'), value: 'light' },
            { label: this.translate.instant('THEME.DARK'), value: 'dark' },
            { label: this.translate.instant('THEME.PINK'), value: 'pink' },
            { label: this.translate.instant('THEME.GREEN'), value: 'green' },
        ];
    }
}
