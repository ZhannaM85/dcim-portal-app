import { Injectable } from '@angular/core';

export type ThemeName = 'light' | 'dark' | 'pink' | 'green';

const THEME_CLASSES: ThemeName[] = ['light', 'dark', 'pink', 'green'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 'app-theme';
    private readonly DEFAULT_THEME: ThemeName = 'light';

    /**
     * Active theme currently applied to the app shell.
     */
    public currentTheme: ThemeName;

    /**
     * Restores persisted theme preference and applies it to the document body.
     */
    constructor() {
        const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeName | null;
        this.currentTheme = saved && THEME_CLASSES.includes(saved) ? saved : this.DEFAULT_THEME;
        this.applyTheme(this.currentTheme);
    }

    /**
     * Sets and persists the selected theme.
     *
     * @param theme Theme name to apply.
     */
    public setTheme(theme: ThemeName): void {
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    }

    /**
     * Updates body classes so only the selected theme class remains.
     *
     * @param theme Theme name to apply.
     */
    private applyTheme(theme: ThemeName): void {
        const body = document.body;
        THEME_CLASSES.forEach(t => body.classList.remove(`theme-${t}`));
        body.classList.add(`theme-${theme}`);
    }
}
