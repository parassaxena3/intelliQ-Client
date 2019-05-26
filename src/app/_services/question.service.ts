import { RestService } from './rest.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { QuesRequest } from '../_dto/ques-request.dto';
import { QuestionCriteria } from '../_dto/question-criteria.dto';
import { QuestionResponseDto } from '../_dto/question-response.dto';

@Injectable()
export class QuestionService {
	constructor(private restService: RestService, private utilityService: UtilityService) {}
	fetchQuestion(groupCode: string, quesId: string) {
		return this.restService.get('question/' + groupCode + '/' + quesId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, false, false);
			})
		);
	}
	viewAllApprovedQuestion(quesRequest: QuesRequest) {
		return this.restService.post('question/all', quesRequest).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return new QuestionResponseDto();
				}
				return result;
			})
		);
	}
	getSuggestions(quesCriteria: QuestionCriteria) {
		return this.restService.post('question/suggestions', quesCriteria, true).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return [];
				}
				return result;
			})
		);
	}

	getFilteredQuestion(quesCriteria: QuestionCriteria) {
		return this.restService.post('question/filter', quesCriteria, true).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return [];
				}
				return result;
			})
		);
	}
}
