import { Pipe, PipeTransform } from '@angular/core';
import { DifficultyType, LengthType, QuestionStatus } from '../_models/enums';

@Pipe({
	name: 'enum'
})
export class EnumPipe implements PipeTransform {
	transform(value: any, enumType?: any): any {
		if (enumType === 'difficulty') {
			switch (value) {
				case DifficultyType.EASY:
					return 'Easy';
				case DifficultyType.MEDIUM:
					return 'Medium';
				case DifficultyType.HARD:
					return 'Hard';
			}
		}
		if (enumType === 'length') {
			switch (value) {
				case LengthType.OBJECTIVE:
					return 'Objective';
				case LengthType.SHORT:
					return 'Short';
				case LengthType.BRIEF:
					return 'Brief';
				case LengthType.LONG:
					return 'Long';
			}
		}
		if (enumType === 'status') {
			switch (value) {
				case QuestionStatus.NEW:
					return 'Add'; // blue
				case QuestionStatus.TRANSIT:
					return 'Modify'; // orange
				case QuestionStatus.REMOVE:
					return 'Remove'; // red
				case QuestionStatus.APPROVED:
					return 'Approved'; // green
				case QuestionStatus.REJECTED:
					return 'Rejected'; // red
			}
		}
		return value;
	}
}
