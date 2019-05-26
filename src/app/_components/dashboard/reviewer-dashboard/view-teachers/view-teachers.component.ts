import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { User } from 'src/app/_models/user.model';
import { RoleType } from 'src/app/_models/enums';
import { UtilityService } from 'src/app/_services/utility.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { stringify } from 'querystring';

@Component({
	selector: 'app-view-teachers',
	templateUrl: './view-teachers.component.html',
	styleUrls: [ './view-teachers.component.css' ]
})
export class ViewTeachersComponent implements OnInit {
	loggedInUser: User;
	users: User[];
	searchTerm: string;
	constructor(
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private utilityService: UtilityService,
		private notificationService: NotificationService
	) {}

	ngOnInit() {
		this.getUsers();
	}
	getUsers() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.userService
			.getTeachersUnderReviewer(this.loggedInUser.school.schoolId, this.loggedInUser.userId)
			.subscribe((users: User[]) => {
				this.users = users;
			});
	}

	calculateAge(dob: string) {
		if (dob === '0001-01-01T00:00:00Z') {
			return null;
		}
		var dateOfBirth = new Date(dob);
		var diff_ms = Date.now() - dateOfBirth.getTime();
		var age_dt = new Date(diff_ms);

		return Math.abs(age_dt.getUTCFullYear() - 1970);
	}

	searchUser() {
		if (!this.searchTerm) {
			this.getUsers();
			return;
		}
		var isValidMobile = this.utilityService.isValidMobile(this.searchTerm);
		var isValidUserName = this.searchTerm.indexOf('@') > -1 && this.searchTerm.indexOf('_') > -1;
		var identifier: string;

		if (isValidMobile) {
			identifier = 'mobile';
		} else if (isValidUserName) {
			identifier = 'userName';
		} else {
			this.notificationService.showErrorWithTimeout('Please enter a valid Mobile or Username!', null, 2000);
			return;
		}
		this.userService
			.getSchoolUserInfo(this.loggedInUser.school.schoolId, identifier, this.searchTerm)
			.subscribe((user: User) => {
				this.users = [];
				if (user) {
					this.users.push(user);
				} else {
					this.notificationService.showErrorWithTimeout(
						'No user found with given ' + identifier + ' !',
						null,
						2000
					);
				}
			});
	}
}
