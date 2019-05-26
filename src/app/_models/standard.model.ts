import { Subject } from './subject.model';

export class Standard {
	public subjects: Subject[];
	constructor(public std: number) {
		this.subjects = [];
	}
}
