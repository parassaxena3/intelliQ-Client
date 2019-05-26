import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/_services/school.service';
import { Observable } from 'rxjs';
import { School } from 'src/app/_models/school.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { User } from 'src/app/_models/user.model';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
	selector: 'app-group-schools',
	templateUrl: './group-schools.component.html',
	styleUrls: [ './group-schools.component.css' ]
})
export class GroupSchoolsComponent implements OnInit {
	schools: School[];
	schoolCode: string;
	constructor(
		private schoolService: SchoolService,
		private localStorageService: LocalStorageService,
		private notificationService: NotificationService
	) {}

	ngOnInit() {
		this.getSchools();
	}
	getSchools() {
		this.schoolService
			.getSchoolsByGroupId(this.localStorageService.getCurrentUser().school.group.groupId)
			.subscribe((schools: School[]) => {
				this.schools = schools;
			});
	}
	searchSchool() {
		if (!this.schoolCode) {
			this.getSchools();
			return;
		}

		this.schoolService.getSchoolBySchoolCode(this.schoolCode).subscribe((school: School) => {
			this.schools = [];
			if (school) {
				this.schools.push(school);
			} else {
				this.notificationService.showErrorWithTimeout('No school found with given code!', null, 2000);
			}
		});
	}
}
