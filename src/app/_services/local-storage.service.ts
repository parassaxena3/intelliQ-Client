import { User } from '../_models/user.model';

export class LocalStorageService {
	getCurrentUser(): User {
		var user = localStorage.getItem('user');
		if (user) {
			return JSON.parse(user);
		}
		return null;
	}

	addItemToLocalStorage(key: string, value: any) {
		if (typeof value !== 'string') {
			value = JSON.stringify(value);
		}
		localStorage.setItem(key, value);
	}

	getItemFromLocalStorage(key: string, convertToObject: boolean): any {
		var value = localStorage.getItem(key);
		if (value && convertToObject) {
			value = JSON.parse(value);
		}
		return value;
	}

	removeItemFromLocalStorage(key: string) {
		localStorage.removeItem(key);
	}
}
