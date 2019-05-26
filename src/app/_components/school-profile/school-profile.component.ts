import { Component, OnInit } from '@angular/core';
import { School } from 'src/app/_models/school.model';
import { SchoolService } from 'src/app/_services/school.service';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { User } from 'src/app/_models/user.model';
import { RoleType } from 'src/app/_models/enums';

@Component({
	selector: 'app-school-profile',
	templateUrl: './school-profile.component.html',
	styleUrls: [ './school-profile.component.css' ]
})
export class SchoolProfileComponent implements OnInit {
	school: School;
	isSchoolAdmin: boolean;
	user: User;
	constructor(private schoolService: SchoolService, private localStorageService: LocalStorageService) {}

	ngOnInit() {
		this.user = this.localStorageService.getCurrentUser();
		this.schoolService.getSchoolBySchoolCode(this.user.school.code).subscribe((school: School) => {
			this.school = school;
		});
		this.isSchoolAdmin = this.user.roles.findIndex((role) => role.roleType === RoleType.SCHOOLADMIN) > -1;
	}
	updateSchool() {
		this.school.contact.mobile = this.convertContactToArray(this.school.contact.mobile, false);
		this.school.contact.landline = this.convertContactToArray(this.school.contact.landline, false);
		this.school.stds = this.convertContactToArray(this.school.stds, true);
		this.schoolService.updateSchool(this.school).subscribe((response) => {
			if (response) {
				this.schoolService.schoolFetched.next(this.school);
			}
		});
	}

	convertContactToArray(data: any, toNumArray: boolean) {
		if (toNumArray) {
			if (typeof data === 'string') {
				return data.split(',').map(function(item) {
					return parseInt(item, 10);
				});
			} else {
				return data;
			}
		}
		if (typeof data === 'string') {
			return data.split(',');
		} else {
			return data;
		}
	}
}
