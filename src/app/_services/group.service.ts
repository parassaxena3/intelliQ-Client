import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { Group } from '../_models/group.model';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class GroupService {
	constructor(private restService: RestService, private utilityService: UtilityService) {}
	public groupFetched = new BehaviorSubject<Group>(null);
	addGroup(group: Group) {
		return this.restService.post('group/add', group).pipe(
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
	getGroupByCode(code: String): Observable<Group> {
		return this.restService.get('group/info/code/' + code).pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, true, false);
				if (result === null) {
					return null;
				}
				this.groupFetched.next(result);
				// process result if required and return same
				return result;
			})
		);
	}
	getAllGroups(): Observable<Group[]> {
		return this.restService.get('group/all/1').pipe(
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

	updateGroup(group: Group) {
		return this.restService.put('group/update', group).pipe(
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
