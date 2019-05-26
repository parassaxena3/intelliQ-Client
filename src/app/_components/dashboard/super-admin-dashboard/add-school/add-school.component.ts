import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/_models/group.model';
import { GroupService } from 'src/app/_services/group.service';
import { Observable, of } from 'rxjs';
import { School } from 'src/app/_models/school.model';
import { Address } from 'src/app/_models/address.model';
import { group } from '@angular/animations';
import { SchoolService } from 'src/app/_services/school.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-add-school',
	templateUrl: './add-school.component.html',
	styleUrls: [ './add-school.component.css' ]
})
export class AddSchoolComponent implements OnInit {
	schools: School[];
	schoolMsg: string;
	selectedGroup: Group;
	groupCode = 'GP_';
	schoolName = '';
	schoolBoard = '';
	city = '';
	state = '';
	pinCode = '';
	btnText = 'Find Group';
	constructor(
		private groupService: GroupService,
		private schoolService: SchoolService,
		private notificationService: NotificationService
	) {}

	ngOnInit() {}
	onSubmit() {
		if (this.selectedGroup) {
			if (this.schoolName && this.schoolBoard && this.city && this.state && this.pinCode) {
				const school = new School();
				school.shortName = this.schoolName;
				school.board = this.schoolBoard;
				school.address = new Address();
				school.address.city = this.city;
				school.address.state = this.state;
				school.address.pincode = this.pinCode;
				school.group = new Group();
				school.group.groupId = this.selectedGroup.groupId;
				school.group.code = this.selectedGroup.code;

				this.schoolService.addSchool(school).subscribe(() => {
					this.schoolService.getSchoolsByGroupId(this.selectedGroup.groupId).subscribe((schools) => {
						this.schools = schools;
						this.resetForm(false);
					});
				});
			} else {
				this.notificationService.showErrorWithTimeout('Please fill all fields', null, 2000);
			}
		} else {
			if (this.groupCode !== '') {
				this.groupService.getGroupByCode(this.groupCode).subscribe((data) => {
					if (data) {
						this.selectedGroup = data;
						this.btnText = 'Add School';
						this.schoolService.getSchoolsByGroupId(this.selectedGroup.groupId).subscribe((schools) => {
							this.schools = schools;
						});
					}
				});
			} else {
				this.notificationService.showErrorWithTimeout('Please enter Group Code', null, 2000);
			}
		}
	}

	resetForm(clearGroup: boolean) {
		if (clearGroup) {
			this.groupCode = 'GP_';
			this.selectedGroup = null;
			this.btnText = 'Find Group';
			this.schools = [];
		}
		this.schoolName = '';
		this.schoolBoard = '';
		this.city = '';
		this.state = '';
		this.pinCode = '';
	}
}
