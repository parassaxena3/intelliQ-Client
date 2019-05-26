import { Section, QuestionPaperDto } from '../_dto/question-paper.dto';
import { TestPaperStatus } from './enums';
import { User } from './user.model';

export class TestPaper {
	public testId: string;
	public teacherId: string;
	public schoolId: string;
	public groupCode: string;
	public std: number;
	public subject: string;
	public tag: string;
	public sets: QuestionPaperDto[];
	public status: TestPaperStatus;
	public createDate: Date;
	public lastModifiedDate: Date;

	constructor(user: User) {
		this.groupCode = user.school.group.code;
		this.teacherId = user.userId;
		this.schoolId = user.school.schoolId;
	}
}
