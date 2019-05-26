import { LengthType } from '../_models/enums';
import { Question } from '../_models/question.model';

export class QuestionPaperDto {
	public set: number;
	public sections: Section[];
}

export class Section {
	public type: LengthType;
	public marks: number;
	public questions: Question[];
}
