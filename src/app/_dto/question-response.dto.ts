import { Question } from '../_models/question.model';

export class QuestionResponseDto {
	public records: number;
	public questions: Question[];
	constructor() {
		this.records = 0;
		this.questions = [];
	}
}
