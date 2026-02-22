import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { highlightText } from '../../utils/utils';

@Pipe({
    name: 'highlight',
    standalone: false,
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    public transform(text: string, search: string): SafeHtml {
        const result = highlightText(text, search);
        if (result === text) {
            return text;
        }
        return this.sanitizer.bypassSecurityTrustHtml(result);
    }
}
