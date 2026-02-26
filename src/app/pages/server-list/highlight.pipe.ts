import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { highlightText } from '../../utils/utils';

@Pipe({
    name: 'highlight',
    standalone: false,
})
export class HighlightPipe implements PipeTransform {
    /**
     * Creates a highlighting HTML fragment for matching search text.
     *
     * @param sanitizer Angular DOM sanitizer.
     */
    constructor(private sanitizer: DomSanitizer) {}

    /**
     * Highlights the search term inside plain text and returns safe HTML.
     *
     * @param text Source text.
     * @param search Search term to highlight.
     * @returns Safe HTML containing highlighted matches.
     */
    public transform(text: string, search: string): SafeHtml {
        const result = highlightText(text, search);
        if (result === text) {
            return text;
        }
        return this.sanitizer.bypassSecurityTrustHtml(result);
    }
}
