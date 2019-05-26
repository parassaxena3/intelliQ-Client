import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { SchoolService } from 'src/app/_services/school.service';
import { School } from 'src/app/_models/school.model';

@Component({
	selector: 'app-school-admin-dashboard',
	templateUrl: './school-admin-dashboard.component.html',
	styleUrls: [ './school-admin-dashboard.component.css' ]
})
export class SchoolAdminDashboardComponent implements OnInit {
	constructor(private localStorageService: LocalStorageService, private schoolService: SchoolService) {}

	ngOnInit() {
		this.schoolService.getSchoolBySchoolCode(this.localStorageService.getCurrentUser().school.code).subscribe();
	}
}
