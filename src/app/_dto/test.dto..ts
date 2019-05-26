import { LengthType } from '../_models/enums';
import { Question } from '../_models/question.model';
import { Template } from '../_models/template.model';
import { TestPaper } from '../_models/testpaper.model';

export class TestDto {
	public constructor(public template: Template, public testpaper: TestPaper) {}
}
