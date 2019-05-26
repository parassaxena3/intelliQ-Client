import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'csv'
})
export class CsvPipe implements PipeTransform {
	transform(value: any, attribute?: any, none?: any): any {
		var csvStr = '';
		if (value && value.length > 0) {
			if (value instanceof Array) {
				if (attribute) {
					value.forEach((element) => {
						csvStr += element[attribute] + ' , ';
					});
				} else {
					value.forEach((element) => {
						csvStr += element + ' , ';
					});
				}

				if (csvStr) {
					return csvStr.slice(0, csvStr.length - 3);
				}
			}

			return value;
		}
		return none;
	}
}
