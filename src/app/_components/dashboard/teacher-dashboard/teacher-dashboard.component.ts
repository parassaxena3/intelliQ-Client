import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/_services/group.service';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { User } from 'src/app/_models/user.model';

@Component({
	selector: 'app-teacher-dashboard',
	templateUrl: './teacher-dashboard.component.html',
	styleUrls: [ './teacher-dashboard.component.css' ]
})
export class TeacherDashboardComponent implements OnInit {
	loggedInUser: User;
	constructor(private groupService: GroupService, private localStorageService: LocalStorageService) {}
	ngOnInit() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.fetchGroup();
	}
	fetchGroup() {
		this.groupService.getGroupByCode(this.loggedInUser.school.group.code).subscribe();
	}
}
