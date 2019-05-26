import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from 'src/app/_services/group.service';
import { Group } from 'src/app/_models/group.model';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-add-group',
	templateUrl: './add-group.component.html',
	styleUrls: [ './add-group.component.css' ]
})
export class AddGroupComponent implements OnInit {
	groupCode = '';
	responseMsg: Observable<string>;
	groups: Observable<Group[]>;
	constructor(private groupService: GroupService) {}

	ngOnInit() {
		this.groups = this.groupService.getAllGroups();
	}

	onSubmit() {
		this.groupService.addGroup(new Group(this.groupCode)).subscribe(() => {
			this.groups = this.groupService.getAllGroups();
			this.groupCode = '';
		});
	}
}
