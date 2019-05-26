import { RestService } from './rest.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Question } from '../_models/question.model';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { QuesRequest } from '../_dto/ques-request.dto';
import { QuestionResponseDto } from '../_dto/question-response.dto';

@Injectable()
export class QuestionRequestService {
	constructor(private restService: RestService, private utilityService: UtilityService) {}

	addQuestion(question: Question) {
		return this.restService.post('question/request/add', question).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	updateQuestion(question: Question) {
		return this.restService.put('question/request/update', question).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	viewQuestionRequests(quesRequest: QuesRequest) {
		return this.restService.post('question/request/all/self', quesRequest).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return new QuestionResponseDto();
				}
				return result;
			})
		);
	}
	viewReviewerRequests(quesRequest: QuesRequest) {
		return this.restService.post('question/request/all', quesRequest).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return new QuestionResponseDto();
				}
				return result;
			})
		);
	}

	deleteQuestionRequest(question: Question) {
		return this.restService.delete('question/request/remove', question).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	approveQuestionRequest(question: Question) {
		return this.restService.put('question/request/approve', question).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	rejectQuestionRequest(question: Question) {
		return this.restService.put('question/request/reject', question).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
}
