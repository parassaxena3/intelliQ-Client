import { User } from './user.model';
import { Contributer } from './question.model';

export class Subject {
	public reviewer: Contributer;
	public topics: string[];
	public tags: string[];

	constructor(public title: string) {}
}
