import { Component, OnInit } from '@angular/core';
import { School } from 'src/app/_models/school.model';
import { User } from 'src/app/_models/user.model';
import { SchoolService } from 'src/app/_services/school.service';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { Constants } from 'src/app/_common/constants';
import { UserService } from 'src/app/_services/user.service';

@Component({
	selector: 'app-timetable',
	templateUrl: './timetable.component.html',
	styleUrls: [ './timetable.component.css' ]
})
export class TimetableComponent implements OnInit {
	school: School;
	user: User;
	constructor(
		private schoolService: SchoolService,
		private localStorageService: LocalStorageService,
		private userService: UserService
	) {}

	ngOnInit() {
		this.user = this.localStorageService.getCurrentUser();
		this.schoolService.getSchoolBySchoolCode(this.user.school.code).subscribe((school: School) => {
			if (school) {
				this.school = school;
				this.user.days = this.user.days && this.user.days.length !== 0 ? this.user.days : Constants.SCHEDULE;
			}
		});
	}

	updateSchedule() {
		var user = new User();
		user.userId = this.user.userId;
		user.days = this.user.days;
		this.userService.updateUserSchedule(user).subscribe((response) => {
			if (response) {
				this.localStorageService.addItemToLocalStorage('user', this.user);
			}
		});
	}
}
