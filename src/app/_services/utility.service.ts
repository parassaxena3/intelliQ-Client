import { RoleType, ResponseStatus, LengthType, DifficultyType, QuestionStatus } from '../_models/enums';
import { AppResponse } from '../_dto/app-response.model';
import { NotificationService } from './notification.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { Role } from '../_models/role.model';
import { RestService } from './rest.service';

@Injectable()
export class UtilityService {
	constructor(
		private notificationService: NotificationService,
		private localStorageService: LocalStorageService,
		private router: Router,
		private restService: RestService
	) {}

	//Roles
	getRoleDescription(roleType: RoleType) {
		switch (roleType) {
			case RoleType.SUPERADMIN:
				return 'super-admin';

			case RoleType.GROUPADMIN:
				return 'group-admin';

			case RoleType.SCHOOLADMIN:
				return 'school-admin';

			case RoleType.REVIEWER:
				return 'reviewer';

			case RoleType.TEACHER:
				return 'teacher';
		}
	}
	getRoleDescriptionForDisplay(roleType: RoleType) {
		switch (roleType) {
			case RoleType.SUPERADMIN:
				return 'Super Admin';

			case RoleType.GROUPADMIN:
				return 'Group Admin';

			case RoleType.SCHOOLADMIN:
				return 'School Admin';

			case RoleType.REVIEWER:
				return 'Reviewer';

			case RoleType.TEACHER:
				return 'Teacher';
		}
	}
	getRoleEnum(roleDesc: String): any {
		switch (roleDesc) {
			case 'super-admin':
				return RoleType.SUPERADMIN;

			case 'group-admin':
				return RoleType.GROUPADMIN;

			case 'school-admin':
				return RoleType.SCHOOLADMIN;

			case 'reviewer':
				return RoleType.REVIEWER;

			case 'teacher':
				return RoleType.TEACHER;
			default:
				return '';
		}
	}

	//Section
	getSectionEnum(section: string) {
		switch (section) {
			case 'Objective':
				return LengthType.OBJECTIVE;
			case 'Short':
				return LengthType.SHORT;
			case 'Brief':
				return LengthType.BRIEF;
			case 'Long':
				return LengthType.LONG;
		}
	}
	getSectionDesc(section: LengthType) {
		switch (section) {
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

	//difficulty
	getDifficultyEnum(difficultyLevel: string) {
		switch (difficultyLevel) {
			case 'Easy':
				return DifficultyType.EASY;
			case 'Medium':
				return DifficultyType.MEDIUM;
			case 'Hard':
				return DifficultyType.HARD;
		}
	}
	getDifficultyDesc(level: DifficultyType) {
		switch (level) {
			case DifficultyType.EASY:
				return 'Easy';
			case DifficultyType.MEDIUM:
				return 'Medium';
			case DifficultyType.HARD:
				return 'Hard';
		}
	}
	getClassForDifficulty(level: DifficultyType) {
		switch (level) {
			case DifficultyType.EASY:
				return 'bg-new';
			case DifficultyType.MEDIUM:
				return 'bg-modify';
			case DifficultyType.HARD:
				return 'bg-blue';
		}
	}

	//Question status
	getClassForStatus(status: QuestionStatus) {
		switch (status) {
			case QuestionStatus.NEW:
				return 'bg-new';
			case QuestionStatus.TRANSIT:
				return 'bg-modify';
			case QuestionStatus.REMOVE:
				return 'bg-remove';
			case QuestionStatus.REJECTED:
				return 'bg-remove';
		}
	}
	getDescriptionForQuestionStatus(status: QuestionStatus) {
		switch (status) {
			case QuestionStatus.NEW:
				return 'New';
			case QuestionStatus.TRANSIT:
				return 'Modify';
			case QuestionStatus.REMOVE:
				return 'Remove';
			case QuestionStatus.REJECTED:
				return 'Rejected';
		}
	}

	getAppResponse(appResponse: AppResponse, showError: boolean, showSuccess: boolean) {
		var timeOut = 3000;
		if (appResponse.status === ResponseStatus.FORBIDDEN && this.router.url !== '/login') {
			this.notificationService.showErrorWithTimeout(appResponse.msg, null, timeOut);
			this.localStorageService.removeItemFromLocalStorage('user');
			this.router.navigate([ '/login' ]);

			return null;
		} else if (appResponse.status === ResponseStatus.ERROR) {
			if (showError) {
				this.notificationService.showErrorWithTimeout(appResponse.msg, null, timeOut);
			}
			return null;
		} else if (appResponse.status === ResponseStatus.SUCCESS) {
			if (showSuccess) {
				this.notificationService.showSuccessWithTimeout(appResponse.body, null, timeOut);
			}
			return appResponse.body;
		}
	}

	isValidMobile(mobile: string): boolean {
		if (mobile && mobile.length === 10 && /^\d{10}$/.test(mobile)) {
			return true;
		}
		return false;
	}

	findRoleIndex(roles: Role[], roleType: RoleType) {
		return roles.findIndex((x) => x.roleType === roleType);
	}

	getIconForGender(gender: string) {
		switch (gender) {
			case 'Male':
				return 'fa-venus';
			case 'Female':
				return 'fa-mars';
			default:
				return 'venus-mars';
		}
	}
}
