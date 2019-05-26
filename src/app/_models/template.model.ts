import { QuestionCriteria } from '../_dto/question-criteria.dto';
import { User } from './user.model';

export class Template {
	public templateId: string;
	public teacherId: string;
	public groupCode: string;
	public tag: string;
	public criteria: QuestionCriteria;
	public createDate: Date;
	public lastModifiedDate: Date;

	constructor(user: User) {
		this.teacherId = user.userId;
		this.groupCode = user.school.group.code;
	}
}
