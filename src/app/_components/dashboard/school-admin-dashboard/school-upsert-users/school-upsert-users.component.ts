import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UtilityService } from 'src/app/_services/utility.service';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { GroupService } from 'src/app/_services/group.service';
import { Subject } from 'src/app/_models/subject.model';
import { Group } from 'src/app/_models/group.model';
import { SchoolService } from 'src/app/_services/school.service';
import { School } from 'src/app/_models/school.model';
import { Role } from 'src/app/_models/role.model';
import { RoleType } from 'src/app/_models/enums';
import { Standard } from 'src/app/_models/standard.model';
import { Contributer } from 'src/app/_models/question.model';

@Component({
	selector: 'app-school-upsert-users',
	templateUrl: './school-upsert-users.component.html',
	styleUrls: [ './school-upsert-users.component.css' ]
})
export class SchoolUpsertUsersComponent implements OnInit {
	roleType = '';
	user: User;
	stds: Number[];
	loggedUser: User;
	subjects: Subject[];
	selectedStd = -1;
	userSearchDone = false;
	stdMap = new Map<number, Map<string, Subject>>();
	reviewerMap: Map<number, Map<string, User[]>>;
	prevMobile = '';
	selectedSubject = '';
	selectedReviewerId = '';
	lastClickedStd = -1;
	lastClickedSub = '';
	isTeacher: boolean;
	school: School;
	constructor(
		private utilityService: UtilityService,
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private notificationService: NotificationService,
		private groupService: GroupService,
		private schoolService: SchoolService
	) {
		this.user = new User();
	}
	@ViewChild('mobileTxt') mobileElem: ElementRef;
	@ViewChild('nameTxt') nameElem: ElementRef;
	ngOnInit() {
		this.loggedUser = this.localStorageService.getCurrentUser();

		this.groupService.getGroupByCode(this.loggedUser.school.group.code).subscribe((group: Group) => {
			if (group) {
				this.subjects = group.subjects;
			}
		});

		this.schoolService.schoolFetched.subscribe((school: School) => {
			if (school) {
				this.stds = school.stds;
				this.school = school;
			}
		});
		this.userService
			.getUsersBySchoolIdAndRoleType(this.loggedUser.school.schoolId, RoleType.REVIEWER)
			.subscribe((reviewers: User[]) => {
				this.createReviewerMap(reviewers);
			});
	}

	onMobileEntered() {
		if (this.prevMobile === this.user.mobile || !this.user.mobile) {
			return;
		}
		this.prevMobile = this.user.mobile;
		if (this.utilityService.isValidMobile(this.user.mobile)) {
			this.userService.getUserInfo('mobile', this.user.mobile).subscribe((user: User) => {
				this.resetForm(false);
				if (user) {
					if (user.school.code && user.school.schoolId !== this.loggedUser.school.schoolId) {
						this.notificationService.showErrorWithTimeout(
							'User is not part of school ' + this.loggedUser.school.shortName,
							null,
							2000
						);
						this.user = new User();
						this.user.mobile = this.mobileElem.nativeElement.value;
						this.mobileElem.nativeElement.focus();
						this.userSearchDone = false;
					} else {
						this.user = user;
						this.userSearchDone = true;
						this.createStdMap();
					}
				} else {
					this.user = new User();
					this.user.mobile = this.mobileElem.nativeElement.value;
					this.userSearchDone = true;
					this.nameElem.nativeElement.focus();
				}
			});
		} else {
			this.notificationService.showErrorWithTimeout('Enter a valid mobile number', null, 2000);
			this.mobileElem.nativeElement.focus();
		}
	}
	createStdMap() {
		var selectedRoleIndex = this.findRoleIndex();
		if (selectedRoleIndex === -1) {
			return;
		}
		var selectedRole = this.user.roles[selectedRoleIndex];
		selectedRole.stds.forEach((standard: Standard) => {
			var subjectMap = new Map<string, Subject>();
			standard.subjects.forEach((subject) => subjectMap.set(subject.title, subject));
			this.stdMap.set(standard.std, subjectMap);
		});
	}
	addRemoveSubject(subject: Subject) {
		if (this.isTeacher) {
			this.verifyLastClickedReviewer();
		}
		var subjectMap: Map<string, Subject>;
		if (this.stdMap.has(this.selectedStd)) {
			subjectMap = this.stdMap.get(this.selectedStd);
			if (subjectMap.has(subject.title)) {
				if (
					this.isTeacher &&
					!(this.lastClickedStd === this.selectedStd && this.lastClickedSub === subject.title)
				) {
					// clicked on previously added subject 1st time to select
					this.lastClickedStd = this.selectedStd;
					this.lastClickedSub = subject.title;
					this.setReviewer();
					return;
				}
				this.selectedSubject = '';
				subjectMap.delete(subject.title);
				if (subjectMap.size === 0) {
					this.stdMap.delete(this.selectedStd);
					return;
				}
			} else {
				this.lastClickedStd = this.selectedStd;
				this.lastClickedSub = subject.title;
				if (this.isTeacher && !this.reviewersExist(subject)) {
					return;
				}
				this.setReviewer();
				subjectMap.set(subject.title, subject);
			}
		} else {
			this.lastClickedStd = this.selectedStd;
			this.lastClickedSub = subject.title;
			if (this.isTeacher && !this.reviewersExist(subject)) {
				return;
			}
			this.setReviewer();
			subjectMap = new Map();
			subjectMap.set(subject.title, subject);
		}
		this.stdMap.set(this.selectedStd, subjectMap);
	}

	verifyLastClickedReviewer() {
		if (this.lastClickedStd !== -1 && this.lastClickedSub !== '') {
			var subjectMap = this.stdMap.get(this.lastClickedStd);
			if (subjectMap) {
				var subject = subjectMap.get(this.lastClickedSub);
				if (subject && !subject.reviewer.userId) {
					subjectMap.delete(this.lastClickedSub);
					if (subjectMap.size === 0) {
						this.stdMap.delete(this.lastClickedStd);
					}
				}
			}
		}
	}

	getClassForSubject(subject: Subject) {
		var cls = '';
		if (this.stdMap.has(this.selectedStd) && this.stdMap.get(this.selectedStd).has(subject.title)) {
			cls = 'bg-new';
		} else {
			cls = 'btn-secondary';
		}
		if (this.isTeacher && this.selectedSubject === subject.title) {
			cls += ' active bg-blue';
		}
		return cls;
	}
	getClassForStandard(std) {
		var cls = '';
		cls = this.stdMap.has(std) ? 'bg-new' : 'btn-secondary';
		if (this.selectedStd === std) {
			cls += ' active bg-blue';
		}
		return cls;
	}
	addUser() {
		if (!this.user.name || (this.user.name && this.user.name.trim().indexOf(' ') === -1)) {
			this.notificationService.showErrorWithTimeout('Please Enter Full Name', null, 2000);
			return;
		}

		var roleType = this.isTeacher ? RoleType.TEACHER : RoleType.REVIEWER;
		var newRole = new Role(roleType);
		this.stdMap.forEach((subjects: Map<string, Subject>, key: number) => {
			var standard = new Standard(key);
			subjects.forEach((subject: Subject) => {
				if (!this.isTeacher || subject.reviewer.userId) {
					standard.subjects.push(subject);
				}
			});
			if (standard.subjects.length > 0) {
				newRole.stds.push(standard);
			}
		});
		var selectedRoleIndex = this.findRoleIndex();

		if (selectedRoleIndex > -1) {
			this.user.roles[selectedRoleIndex] = newRole;
		} else {
			this.user.roles.push(newRole);
		}

		this.user.school = this.school;
		if (this.user.userId) {
			this.userService.updateUser(this.user).subscribe((response) => {
				if (response && this.user.userId === this.loggedUser.userId) {
					this.localStorageService.addItemToLocalStorage('user', this.user);
				}
			});
		} else {
			this.userService.addUser(this.user).subscribe((response) => {
				if (response) {
					this.resetForm(true);
				}
			});
		}
	}

	findRoleIndex() {
		var roleType = this.isTeacher ? RoleType.TEACHER : RoleType.REVIEWER;
		return this.user.roles.findIndex((x) => x.roleType === roleType);
	}

	createReviewerMap(reviewers: User[]) {
		if (!this.reviewerMap) {
			this.reviewerMap = new Map<number, Map<string, User[]>>();
			reviewers.forEach((reviewer: User) => {
				var roles = reviewer.roles;
				roles.forEach((role: Role) => {
					if (role.roleType === RoleType.REVIEWER) {
						var stds = role.stds;
						stds.forEach((standard: Standard) => {
							var subjectMap: Map<string, User[]>;
							if (this.reviewerMap.has(standard.std)) {
								subjectMap = this.reviewerMap.get(standard.std);
							} else {
								subjectMap = new Map<string, User[]>();
							}
							standard.subjects.forEach((subject: Subject) => {
								var users: User[] = new Array();
								if (subjectMap.has(subject.title)) {
									users = subjectMap.get(subject.title);
								}
								users.push(reviewer);
								subjectMap.set(subject.title, users);
							});
							this.reviewerMap.set(standard.std, subjectMap);
						});
					}
				});
			});
		}
	}

	setReviewer() {
		if (this.stdMap.has(this.selectedStd)) {
			var subjectMap = this.stdMap.get(this.selectedStd);
			if (subjectMap.has(this.selectedSubject)) {
				this.selectedReviewerId = subjectMap.get(this.selectedSubject).reviewer.userId;
				return;
			}
		}

		this.selectedReviewerId = '';
	}

	reviewersExist(subject: Subject) {
		if (this.reviewerMap.has(this.selectedStd)) {
			var userMap = this.reviewerMap.get(this.selectedStd);
			if (userMap.has(subject.title)) {
				return true;
			}
		}
		this.selectedSubject = '';
		this.notificationService.showErrorWithTimeout('No Reviewer found for selected subject', null, 2000);
		return false;
	}
	updateReviewer() {
		var selectedRev = this.reviewerMap
			.get(this.selectedStd)
			.get(this.selectedSubject)
			.find((x) => x.userId === this.selectedReviewerId);

		this.stdMap.get(this.selectedStd).get(this.selectedSubject).reviewer = new Contributer(
			selectedRev.userId,
			selectedRev.userName
		);
	}
	resetForm(resetAll: boolean) {
		if (resetAll) {
			this.user = new User();
			this.userSearchDone = false;
			this.roleType = '';
			this.prevMobile = '';
		}
		this.stdMap = new Map();
		this.selectedStd = -1;
		this.selectedSubject = '';
		this.selectedReviewerId = '';
		this.lastClickedStd = -1;
		this.lastClickedSub = '';
	}
}
