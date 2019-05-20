import { Pipe, PipeTransform } from '@angular/core';
import { ObjFilter } from '../_dto/filter.dto';
import { filter } from 'rxjs/operators';

@Pipe({
	name: 'filter'
})
export class FilterPipe implements PipeTransform {
	transform(values: any[], objFilters?: ObjFilter[]): any {
		debugger;
		if (values && objFilters && objFilters.length > 0) {
			objFilters.forEach((fltr) => {
				if (fltr.value || fltr.value !== -1) {
					values = values.filter((v) => v[fltr.key] === fltr.value);
				}
			});
		}
		return values;
	}
}
