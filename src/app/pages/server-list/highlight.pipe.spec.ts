import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
    let pipe: HighlightPipe;
    let sanitizer: DomSanitizer;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        sanitizer = TestBed.inject(DomSanitizer);
        pipe = new HighlightPipe(sanitizer);
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return original text when search is empty', () => {
        expect(pipe.transform('hello world', '')).toBe('hello world');
    });

    it('should return original text when search is too short', () => {
        expect(pipe.transform('hello world', 'he')).toBe('hello world');
    });

    it('should return original text when text is empty', () => {
        expect(pipe.transform('', 'hello')).toBe('');
    });

    it('should highlight matching text', () => {
        const result = pipe.transform('hello world', 'hello');
        const html = (result as { changingThisBreaksApplicationSecurity?: string })
            ?.changingThisBreaksApplicationSecurity ?? String(result);
        expect(html).toContain('<mark>hello</mark>');
    });

    it('should be case-insensitive', () => {
        const result = pipe.transform('Hello World', 'hello');
        const html = (result as { changingThisBreaksApplicationSecurity?: string })
            ?.changingThisBreaksApplicationSecurity ?? String(result);
        expect(html).toContain('<mark>Hello</mark>');
    });

    it('should return original text when no match', () => {
        const result = pipe.transform('hello world', 'xyz');
        expect(result).toBe('hello world');
    });
});
