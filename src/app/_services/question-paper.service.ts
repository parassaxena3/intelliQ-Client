import { RestService } from './rest.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { QuestionCriteria } from '../_dto/question-criteria.dto';
import { TestDto } from '../_dto/test.dto.';

@Injectable()
export class QuestionPaperService {
	constructor(private restService: RestService, private utilityService: UtilityService) {}

	generateQuestionPaper(queCriteria: QuestionCriteria) {
		return this.restService.post('paper/generate', queCriteria).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}
	savePaper(testDto: TestDto, status: string) {
		return this.restService.post('paper/' + status, testDto).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}

	fetchTemplates(groupCode: string, teacherId: string) {
		return this.restService.get('paper/templates/' + groupCode + '/' + teacherId).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return [];
				}
				// process result if required and return same
				return result;
			})
		);
	}
	fetchTemplate(groupCode: string, templateId: string) {
		return this.restService.get('paper/template/' + groupCode + '/' + templateId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}
	deleteTemplate(groupCode: string, templateId: string) {
		return this.restService.delete('paper/template/' + groupCode + '/' + templateId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	fetchDrafts(groupCode: string, teacherId: string) {
		return this.restService.get('paper/drafts/' + groupCode + '/' + teacherId).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return [];
				}
				// process result if required and return same
				return result;
			})
		);
	}
	fetchDraft(groupCode: string, draftId: string) {
		return this.restService.get('paper/draft/' + groupCode + '/' + draftId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}
	deleteDraft(groupCode: string, draftId: string) {
		return this.restService.delete('paper/draft/' + groupCode + '/' + draftId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	fetchPapers(groupCode: string, teacherId: string) {
		return this.restService.get('paper/release/' + groupCode + '/' + teacherId).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return [];
				}
				// process result if required and return same
				return result;
			})
		);
	}
}
