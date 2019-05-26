import { QuestionStatus } from '../_models/enums';
import { Standard } from '../_models/standard.model';

export class QuesRequest {
	public groupCode: string;
	public schoolID: string;
	public userID: string;
	public standards: Standard[];
	public status: QuestionStatus;
	public page: number;
	public getCount: boolean;
}
