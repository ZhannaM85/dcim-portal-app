import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DropdownOption } from '@zhannam85/ui-kit';

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
    ];

    public currentLang: string;

    constructor(private translate: TranslateService) {
        this.translate.addLangs(['en', 'ru', 'de', 'fr']);
        this.translate.setDefaultLang('en');

        const savedLang = localStorage.getItem('app-lang');
        this.currentLang = savedLang && this.translate.getLangs().includes(savedLang) ? savedLang : 'en';
        this.translate.use(this.currentLang);
    }

    public switchLanguage(lang: string): void {
        this.currentLang = lang;
        this.translate.use(lang);
        localStorage.setItem('app-lang', lang);
    }
}
