import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { Group } from '../_models/group.model';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { UtilityService } from './utility.service';
import { Observable } from 'rxjs';
import { Meta } from '../_models/meta.model';

@Injectable()
export class MetaService {
	constructor(private restService: RestService, private utilityService: UtilityService) {}

	getMeta(): Observable<Meta> {
		return this.restService.get('meta/read').pipe(
			map((appResponse: AppResponse) => {
				var result = this.utilityService.getAppResponse(appResponse, false, false);
				if (result === null) {
					return null;
				}
				// process result if required and return same
				return result;
			})
		);
	}
	addMeta(meta: Meta) {
		return this.restService.post('meta/add', meta).pipe(
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

	updateMeta(meta: Meta) {
		return this.restService.put('meta/update', meta).pipe(
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

	deleteMeta(meta: Meta) {
		return this.restService.delete('meta/remove', meta).pipe(
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
