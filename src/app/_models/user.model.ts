import { Role } from './role.model';
import { School } from './school.model';

export class User {
	public userId: string;
	public name: string;
	public userName: string;
	public gender: string;
	public mobile: string;
	public email: string;
	public password: string;
	public dob: Date;
	public createDate: Date;
	public lastModifiedDate: Date;
	public school: School;
	public prevSchools: School[];
	public roles: Role[];
	public days: Day[];
	constructor() {
		this.roles = [];
		this.prevSchools = [];
		this.days = [];
	}
}
export class Day {
	public day: string;
	public periods: Period[];
	constructor() {
		this.periods = [];
	}
}

export class Period {
	public hour: number;
	public std: string;
	public subject: string;
}
