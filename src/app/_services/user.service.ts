import { Injectable, OnInit } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { UtilityService } from './utility.service';
import { map } from 'rxjs/operators';
import { AppResponse } from '../_dto/app-response.model';
import { RestService } from './rest.service';
import { User } from '../_models/user.model';
import { RoleType, ResponseStatus } from '../_models/enums';
import { NotificationService } from './notification.service';
import { Profile } from '../_dto/profile.dto';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserService implements OnInit {
	userRoleUpdated = new BehaviorSubject<string>(null);
	userDetailsUpdated = new BehaviorSubject<User>(null);
	constructor(
		private localStorageService: LocalStorageService,
		private utilityService: UtilityService,
		private restService: RestService,
		private notificationService: NotificationService
	) {}

	ngOnInit(): void {}
	getUserRoles() {
		var user = this.localStorageService.getCurrentUser();
		if (user) {
			var roles = [];
			user.roles.forEach((role) => {
				roles.push(this.utilityService.getRoleDescription(role.roleType));
			});
			return roles;
		}
		return null;
	}

	getSchoolUserInfo(schoolId: string, identifier: string, value: String) {
		return this.restService.get('user/school/info/' + schoolId + '/' + identifier + '/' + value).pipe(
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

	getUserInfo(identifier: string, value: String) {
		return this.restService.get('user/info/' + identifier + '/' + value).pipe(
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

	getUserById(userId: String) {
		return this.restService.get('user/info/_id/' + userId);
	}

	addUser(user: User) {
		return this.restService.post('user/add', user).pipe(
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
	updateUser(user: User) {
		return this.restService.put('user/update', user).pipe(
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
	updateUserRoles(user: User) {
		return this.restService.put('user/update/roles', user).pipe(
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
	updateUserSchedule(user: User) {
		return this.restService.put('user/updateSchedule', user).pipe(
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
	getUsersBySchoolId(schoolId: string) {
		return this.restService.get('user/all/school/' + schoolId).pipe(
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
	getUsersBySchoolIdAndRoleType(schoolId: string, roleType: RoleType) {
		return this.restService.get('user/all/school/' + schoolId + '/' + roleType).pipe(
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
	getTeachersUnderReviewer(schoolId: string, reviewerId: string) {
		return this.restService.get('user/all/reviewer/' + schoolId + '/' + reviewerId).pipe(
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

	removeUser(schoolId: string, userId: string) {
		return this.restService.delete('user/remove/' + schoolId + '/' + userId, null).pipe(
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
	resetPassword(profile: Profile) {
		return this.restService.post('user/reset/pwd', profile).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	updateMobile(profile: Profile) {
		return this.restService.post('user/update/mobile', profile).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, true);
			})
		);
	}
	generateMobileOtp(mobile: string) {
		return this.restService.get('user/new/mobile/' + mobile).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}
	verifyOtp(otp: string, otpSessionId: string) {
		return this.restService.get('user/otp/verify/' + otp, otpSessionId).pipe(
			map((appResponse: AppResponse) => {
				return this.utilityService.getAppResponse(appResponse, true, false);
			})
		);
	}
	login(user: User) {
		return this.restService.post('user/login', user);
	}

	logout() {
		this.restService.get('user/logout').subscribe((appResponse: AppResponse) => {
			if (appResponse.status === ResponseStatus.FORBIDDEN) {
				this.notificationService.showErrorWithTimeout('Session time out!', null, 2000);
			} else if (appResponse.status === ResponseStatus.SUCCESS) {
				this.notificationService.showSuccessWithTimeout(appResponse.body, null, 2000);
			}
		});
	}
}
