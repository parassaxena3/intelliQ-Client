import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'safe'
})
export class SafePipe implements PipeTransform {
	constructor(protected sanitizer: DomSanitizer) {}
	transform(value: any, type: string): any {
		switch (type) {
			case 'html':
				return this.sanitizer.bypassSecurityTrustHtml(value);
			default:
				throw new Error(`Invalid safe type specified: ${type}`);
		}
	}
}
