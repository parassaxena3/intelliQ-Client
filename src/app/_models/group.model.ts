import { Subject } from './subject.model';

export class Group {
	groupId: string;
	code: string;
	quesCategories: string[];
	createDate: Date;
	lastModifiedDate: Date;
	subjects: Subject[];

	constructor(code?: string) {
		this.code = code;
	}
}
