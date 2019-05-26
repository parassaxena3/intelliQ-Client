import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { Group } from '../_models/group.model';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { School } from '../_models/school.model';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class SchoolService {
	constructor(
		private restService: RestService,
		private utilityService: UtilityService,
		private localStorageService: LocalStorageService
	) {}
	public schoolFetched = new BehaviorSubject<School>(null);

	addSchool(school: School) {
		return this.restService.post('school/add', school).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, true);
				if (result === null) {
					return null;
				}
				// process result if required and return same
				return result;
			})
		);
	}

	getSchoolBySchoolCode(schoolCode: string) {
		return this.restService.get('school/info/code/' + schoolCode).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return null;
				}
				var school = result as School;
				if (this.localStorageService.getCurrentUser().school.code === school.code) {
					this.schoolFetched.next(result);
				}
				// process result if required and return same
				return result;
			})
		);
	}
	getSchoolByGroupCode(groupCode: string) {
		return this.restService.get('school/all/code/' + groupCode).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return null;
				}
				// process result if required and return same
				return result;
			})
		);
	}
	getSchoolsByGroupId(groupId: string) {
		return this.restService.get('school/all/_id/' + groupId).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return null;
				}
				// process result if required and return same
				return result;
			})
		);
	}
	updateSchool(school: School) {
		return this.restService.put('school/update', school).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, true);
				if (result === null) {
					return null;
				}
				// process result if required and return same
				return result;
			})
		);
	}
}
