import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';
import { SchoolService } from 'src/app/_services/school.service';
import { GroupService } from 'src/app/_services/group.service';
import { School } from 'src/app/_models/school.model';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user.model';
import { Role } from 'src/app/_models/role.model';
import { RoleType } from 'src/app/_models/enums';
import { Group } from 'src/app/_models/group.model';

@Component({
	selector: 'app-add-admin',
	templateUrl: './add-admin.component.html',
	styleUrls: [ './add-admin.component.css' ]
})
export class AddAdminComponent implements OnInit {
	adminType: string;
	schoolCode: string;
	groupCode = 'GP_';
	selectedSchool: School;
	mobile: string;
	selectedUser: User;
	userSearchDone = false;
	name: string;
	isAlreadySchoolAdmin = false;
	selectedGroup: Group;
	isAlreadyGroupAdmin = false;
	constructor(
		private notificationService: NotificationService,
		private schoolService: SchoolService,
		private groupService: GroupService,
		private userService: UserService
	) {
		this.adminType = '';
	}

	ngOnInit() {}

	findSchool() {
		if (this.schoolCode) {
			this.schoolService.getSchoolBySchoolCode(this.schoolCode).subscribe((school) => {
				this.selectedSchool = school;
				if (!school) {
					this.showErrorMsg('School not found');
				} else {
					this.selectedGroup = this.selectedSchool.group;
				}
			});
		} else {
			this.showErrorMsg('Please enter School Code');
		}
	}

	findGroup() {
		if (this.groupCode) {
			this.groupService.getGroupByCode(this.groupCode).subscribe((group: Group) => {
				this.selectedGroup = group;
			});
		} else {
			this.showErrorMsg('Please enter Group Code');
		}
	}

	findUser() {
		if (this.mobile && this.mobile.length === 10) {
			this.userService.getUserInfo('mobile', this.mobile).subscribe((user: User) => {
				if (
					this.adminType !== 'superAdmin' &&
					user.school.schoolId &&
					user.school.group.groupId !== this.selectedGroup.groupId
				) {
					this.notificationService.showErrorWithTimeout(
						'User is not part of group ' + this.selectedGroup.code,
						null,
						2000
					);
					this.resetForm();
					return;
				}
				this.userSearchDone = true;
				this.selectedUser = user;
				if (this.selectedUser) {
					this.name = this.selectedUser.name;
					if (this.selectedUser.roles.findIndex((z) => z.roleType === RoleType.SCHOOLADMIN) > -1) {
						this.isAlreadySchoolAdmin = true;
					}
					if (this.selectedUser.roles.findIndex((z) => z.roleType === RoleType.GROUPADMIN) > -1) {
						this.isAlreadyGroupAdmin = true;
					}
				}
			});
		} else {
			this.notificationService.showErrorWithTimeout('Please enter valid Mobile number', null, 2000);
		}
	}

	addUser() {
		if (this.name) {
			var roleType: any, school: School;
			if (this.adminType === 'schoolAdmin') {
				roleType = RoleType.SCHOOLADMIN;
				school = this.selectedSchool;
			} else if (this.adminType === 'superAdmin') {
				roleType = RoleType.SUPERADMIN;
			} else {
				roleType = RoleType.GROUPADMIN;
				school = new School();
				school.code = 'MASTER';
				school.group = this.selectedGroup;
			}

			const user = new User();
			user.name = this.name;
			user.school = school;
			user.mobile = this.mobile;
			user.roles = [ new Role(roleType) ];
			this.userService.addUser(user).subscribe(() => {
				this.resetForm();
			});
		} else {
			this.notificationService.showErrorWithTimeout('Please enter Name', null, 2000);
		}
	}

	assignRoleToUser() {
		var roleType: any, school: School;

		if (!this.selectedUser.school.code) {
			// for deleted user
			if (this.adminType === 'schoolAdmin') {
				school = this.selectedSchool;
			} else {
				school = new School();
				school.code = 'MASTER';
				school.group = this.selectedGroup;
			}
			this.selectedUser.school = school;
		}

		if (this.adminType === 'schoolAdmin') {
			roleType = RoleType.SCHOOLADMIN;
			this.selectedUser.school = this.selectedSchool;
		} else {
			roleType = RoleType.GROUPADMIN;
		}
		this.selectedUser.roles.push(new Role(roleType));

		this.userService.updateUser(this.selectedUser).subscribe((response) => {
			this.resetForm();
		});
	}
	resetForm() {
		this.adminType = '';
		this.groupCode = 'GP_';
		this.schoolCode = '';
		this.selectedSchool = null;
		this.mobile = '';
		this.selectedUser = null;
		this.userSearchDone = false;
		this.name = '';
		this.isAlreadySchoolAdmin = false;
		this.selectedGroup = null;
		this.isAlreadyGroupAdmin = false;
	}

	showErrorMsg(msg: string) {
		this.notificationService.showErrorWithTimeout(msg, null, 2000);
	}
}
