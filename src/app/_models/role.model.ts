import { RoleType } from './enums';
import { Standard } from './standard.model';

export class Role {
	public stds: Standard[];
	constructor(public roleType: RoleType) {
		this.stds = [];
	}
}
