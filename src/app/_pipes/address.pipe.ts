import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../_models/address.model';

@Pipe({
	name: 'address'
})
export class AddressPipe implements PipeTransform {
	transform(value: Address, none?: any): any {
		var address = '';

		if (value) {
			if (value.area) {
				address += value.area + ', ';
			}
			if (value.city) {
				address += value.city;
			}
			if (value.state) {
				address += ', ' + value.state.toUpperCase();
			}
			if (value.pincode) {
				address += ' - ' + value.pincode;
			}
		}

		return address ? address : none;
	}
}
