import { DifficultyType, LengthType, QuestionStatus } from './enums';
import { School } from './school.model';

export class Question {
	public quesId: string;
	public title: string;
	public titleHtml: string;
	public std: number;
	public subject: string;
	public topic: string;
	public difficulty: DifficultyType;
	public length: LengthType;
	public status: QuestionStatus;
	public tags: string[];
	public category: string;
	public imageUrl: string;
	public owner: Contributer;
	public reviewer: Contributer;
	public school: School;
	public groupCode: string;
	public createDate: Date;
	public lastModifiedDate: Date;
	public rejectDesc: string;
	public originId: string;
	public marks: number;
	constructor() {}
}

export class Contributer {
	constructor(public userId: string, public userName: string) {}
}
