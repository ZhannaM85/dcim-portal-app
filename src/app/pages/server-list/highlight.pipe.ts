import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'highlight',
    standalone: false,
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    public transform(text: string, search: string): SafeHtml {
        if (!search || search.length < 3 || !text) {
            return text;
        }

        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const highlighted = text.replace(regex, '<mark>$1</mark>');

        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }
}
