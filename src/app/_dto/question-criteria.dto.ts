import { LengthType, DifficultyType } from '../_models/enums';

export class QuestionCriteria {
	public topics: string[];
	public tags: string[];
	public sets: number;
	public length: QuesLength[];
	public difficulty: QuesDifficulty[];
	public page: number;
	public totalMarks: number;
	constructor(public groupCode: string, public std: number, public subject: string, public searchTerm: string) {}
}

export class QuesLength {
	public type: LengthType;
	public count: number;
	public marks: number;
}

// QuesDifficulty difficulty level - EASY,MEDIUM,HARD
export class QuesDifficulty {
	public level: DifficultyType;
	public percent: number;
}
