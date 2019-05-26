import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService } from 'src/app/_services/group.service';
import { Group } from 'src/app/_models/group.model';
import { Subscription } from 'rxjs';
import { MetaService } from 'src/app/_services/meta.service';
import { Meta } from 'src/app/_models/meta.model';
import { Subject } from 'src/app/_models/subject.model';

@Component({
	selector: 'app-group-profile',
	templateUrl: './group-profile.component.html',
	styleUrls: [ './group-profile.component.css' ]
})
export class GroupProfileComponent implements OnInit, OnDestroy {
	group: Group;
	subject: string;
	groupSubscription: Subscription;
	metaSubscription: Subscription;
	subjectSuggestions: Set<string>;
	existingSubjects: Map<string, Subject>;
	originalSuggestions: string;
	constructor(private groupService: GroupService, private metaService: MetaService) {}

	ngOnInit() {
		this.metaSubscription = this.metaService.getMeta().subscribe((metadata: Meta) => {
			this.subjectSuggestions = new Set<string>();
			metadata.subjects.forEach((subject) => this.subjectSuggestions.add(subject));
			this.fetchGroup();
		});
	}
	fetchGroup() {
		this.groupSubscription = this.groupService.groupFetched.subscribe((group: Group) => {
			if (group) {
				this.existingSubjects = new Map<string, Subject>();
				this.group = group;
				this.group.subjects.forEach((subject) => {
					this.existingSubjects.set(subject.title, subject);
					this.subjectSuggestions.delete(subject.title);
				});
				this.originalSuggestions = JSON.stringify(Array.from(this.subjectSuggestions.values()));
			}
		});
	}
	addSubject(event) {
		if (event.item) {
			var subject: Subject;
			if (this.existingSubjects.has(event.item)) {
				subject = this.existingSubjects.get(event.item);
			} else {
				subject = new Subject(event.item);
			}
			this.group.subjects.push(subject);
			this.subjectSuggestions.delete(event.item);
			this.subject = '';
		}
	}
	removeSubject(subject: string) {
		this.group.subjects = this.group.subjects.filter((x) => x.title !== subject);
		this.subjectSuggestions.add(subject);
	}
	updateGroup() {
		this.groupService.updateGroup(this.group).subscribe((response) => {
			if (response) {
				this.group.lastModifiedDate = new Date();
				this.groupService.groupFetched.next(this.group);
			}
		});
	}

	onCancel() {
		this.group.subjects = [];
		this.existingSubjects.forEach((subject) => this.group.subjects.push(subject));
		var arr = JSON.parse(this.originalSuggestions);
		this.subjectSuggestions = new Set(arr);
	}
	ngOnDestroy() {
		if (this.groupSubscription) {
			this.groupSubscription.unsubscribe();
		}
	}
}
