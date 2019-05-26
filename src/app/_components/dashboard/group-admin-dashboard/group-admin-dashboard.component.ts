import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/_services/group.service';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { map } from 'rxjs/operators';
import { Group } from 'src/app/_models/group.model';

@Component({
	selector: 'app-group-admin-dashboard',
	templateUrl: './group-admin-dashboard.component.html',
	styleUrls: [ './group-admin-dashboard.component.css' ]
})
export class GroupAdminDashboardComponent implements OnInit {
	constructor(private groupService: GroupService, private localStorageService: LocalStorageService) {}

	ngOnInit() {
		this.groupService.getGroupByCode(this.localStorageService.getCurrentUser().school.group.code).subscribe();
	}
}
