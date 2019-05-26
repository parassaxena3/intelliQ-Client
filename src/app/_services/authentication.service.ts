import { Injectable, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { LocalStorageService } from './local-storage.service';
import { User } from '../_models/user.model';
import { AppResponse } from '../_dto/app-response.model';
import { ResponseStatus } from '../_models/enums';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { CookieService } from 'ngx-cookie-service';
import { SchoolService } from './school.service';
import { GroupService } from './group.service';

@Injectable()
export class AuthenticationService implements OnInit {
	constructor(
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private router: Router,
		private notificationService: NotificationService,
		private cookieService: CookieService,
		private schoolService: SchoolService,
		private groupService: GroupService
	) {
		var user = this.localStorageService.getCurrentUser();
		if (user) {
			this.refreshDetails(user.userId);
		}
	}

	ngOnInit() {}

	isAuthenticated(): boolean {
		return this.localStorageService.getCurrentUser() !== null && this.cookieService.check('XSRF-TOKEN');
	}

	login(user: User) {
		return this.userService.login(user);
	}

	persistUser(user: User) {
		this.localStorageService.addItemToLocalStorage('user', user);
		this.userService.userDetailsUpdated.next(user);
	}

	logout(redirectToLogin: boolean) {
		if (this.cookieService.check('XSRF-TOKEN')) {
			this.userService.logout();
		}
		this.localStorageService.removeItemFromLocalStorage('user');
		this.userService.userDetailsUpdated.next(null);
		this.userService.userRoleUpdated.next(null);
		this.schoolService.schoolFetched.next(null);
		this.groupService.groupFetched.next(null);
		if (redirectToLogin) {
			this.router.navigate([ '/login' ]);
		}
	}

	refreshDetails(userId: String) {
		this.userService.getUserById(userId).subscribe((appResponse: AppResponse) => {
			if (appResponse.status === ResponseStatus.ERROR) {
				this.notificationService.showErrorWithTimeout(appResponse.msg, null, 2000);
				this.logout(true);
			} else if (appResponse.status === ResponseStatus.SUCCESS) {
				if (appResponse.body) {
					this.persistUser(appResponse.body);
				} else {
					this.logout(true);
				}
			} else if (appResponse.status === ResponseStatus.FORBIDDEN) {
				// this.notificationService.showErrorWithTimeout(appResponse.msg, null, 2000);
				this.localStorageService.removeItemFromLocalStorage('user');
				this.router.navigate([ '/login' ]);
			}
		});
	}
}
