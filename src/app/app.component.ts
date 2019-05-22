import { Component, OnInit } from '@angular/core';
import { User } from './_models/user.model';
import { UserService } from './_services/user.service';
import { AuthenticationService } from './_services/authentication.service';
import { Constants } from './_common/constants';
import { RoleType } from './_models/enums';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
	public abcd: boolean;
	title = 'IntelliQ';
	currentUser: User;
	loggedIn = false;
	showSchoolProfile: boolean;
	showTimetable: boolean;
	dateFormat = Constants.DATE_FORMAT;
	currentRole: string;
	constructor(private userService: UserService, private authService: AuthenticationService) {}

	ngOnInit() {
		this.userService.userDetailsUpdated.subscribe((user: User) => {
			setTimeout(() => {
				this.currentUser = user;
				this.loggedIn = user ? true : false;
				if (user) {
					this.showSchoolProfile = !(
						user.roles.length === 1 &&
						(user.roles[0].roleType === RoleType.GROUPADMIN ||
							user.roles[0].roleType === RoleType.SUPERADMIN)
					);
					this.showTimetable = user.roles.findIndex((role) => role.roleType === RoleType.TEACHER) > -1;
				}
			}, 0);
		});
		this.userService.userRoleUpdated.subscribe((role: string) => {
			this.currentRole = role;
		});
		this.getCurrentRole();
	}
	getCurrentRole() {
		var path = window.location.pathname;
		if (path.indexOf('super-admin') > -1) {
			this.userService.userRoleUpdated.next('super-admin');
		} else if (path.indexOf('group-admin') > -1) {
			this.userService.userRoleUpdated.next('group-admin');
		} else if (path.indexOf('school-admin') > -1) {
			this.userService.userRoleUpdated.next('school-admin');
		} else if (path.indexOf('reviewer') > -1) {
			this.userService.userRoleUpdated.next('reviewer');
		} else if (path.indexOf('teacher') > -1) {
			this.userService.userRoleUpdated.next('teacher');
		}
	}
	logout() {
		this.authService.logout(true);
	}
}
