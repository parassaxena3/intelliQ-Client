import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'rolePipe'
})
export class RolePipePipe implements PipeTransform {
	transform(value: string, args?: any): any {
		return value.replace('-', ' ');
	}
}
