import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { Profile } from 'src/app/_dto/profile.dto';
import { NotificationService } from 'src/app/_services/notification.service';
import { UtilityService } from 'src/app/_services/utility.service';
import { NgForm } from '@angular/forms';
import { RoleType } from 'src/app/_models/enums';
import { Role } from 'src/app/_models/role.model';
import { Standard } from 'src/app/_models/standard.model';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: [ './user-profile.component.css' ]
})
export class UserProfileComponent implements OnInit {
	dob: Date;
	minDate: Date;
	maxDate: Date;
	hideModal: boolean;
	otp1: string;
	otp2: string;
	otp3: string;
	otp4: string;
	otp5: string;
	otp6: string;
	user: User;
	activeTab = 'password';
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
	newMobile: string;
	otpSessionId: string;
	firstName: string;
	lastName: string;
	isReviewer: boolean;
	isTeacher: boolean;
	reviewerStds: Standard[];
	teacherStds: Standard[];
	@ViewChild('closeModal') closeModal: ElementRef;
	constructor(
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private notificationService: NotificationService,
		private utilityService: UtilityService
	) {}

	ngOnInit() {
		this.user = this.localStorageService.getCurrentUser();
		this.minDate = new Date(1940, 1, 1);
		this.maxDate = new Date();
		this.dob = new Date(this.user.dob);
		var index = this.user.name.indexOf(' ');
		this.firstName = this.user.name.substring(0, index);
		this.lastName = this.user.name.substring(index + 1);
		this.user.roles.forEach((role: Role) => {
			if (role.roleType === RoleType.REVIEWER) {
				this.isReviewer = true;
				this.reviewerStds = role.stds;
				this.reviewerStds.sort((a, b) => {
					return a.std - b.std;
				});
			}
			if (role.roleType === RoleType.TEACHER) {
				this.isTeacher = true;
				this.teacherStds = role.stds;
				this.teacherStds.sort((a, b) => {
					return a.std - b.std;
				});
			}
		});
	}
	updateUser() {
		this.user.dob = new Date(this.dob);
		this.user.name = this.firstName + ' ' + this.lastName;
		this.userService.updateUser(this.user).subscribe((response) => {
			if (response) {
				this.localStorageService.addItemToLocalStorage('user', this.user);
				this.userService.userDetailsUpdated.next(this.user);
			}
		});
	}
	updatePassword(pwdForm: NgForm) {
		var profile = new Profile();
		profile.userId = this.user.userId;
		profile.oldPwd = this.oldPassword;
		profile.newPwd = this.newPassword;
		profile.forgotPwd = false;
		this.userService.resetPassword(profile).subscribe((response) => {
			if (response) {
				pwdForm.form.reset();
			}
		});
	}

	generateOtp() {
		this.userService.generateMobileOtp(this.newMobile).subscribe((response) => {
			if (response) {
				this.notificationService.showSuccessWithTimeout('OTP sent successfully !!', null, 2000);
				this.otpSessionId = response;
				this.otp1 = this.otp2 = this.otp3 = this.otp4 = this.otp5 = this.otp6 = '';
			}
		});
	}
	verifyOtp() {
		var otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;
		if (otp && otp.length === 6) {
			this.userService.verifyOtp(otp, this.otpSessionId).subscribe((response) => {
				if (response) {
					var profile = new Profile();
					profile.userId = this.user.userId;
					profile.mobile = this.newMobile;
					this.userService.updateMobile(profile).subscribe((res) => {
						if (res) {
							this.user.mobile = this.newMobile;
							this.newMobile = '';
							this.otp1 = this.otp2 = this.otp3 = this.otp4 = this.otp5 = this.otp6 = '';
							this.localStorageService.addItemToLocalStorage('user', this.user);
							this.userService.userDetailsUpdated.next(this.user);
							this.closeModal.nativeElement.click();
						}
					});
				}
			});
		}
	}
	reset() {
		this.newMobile = '';
		this.oldPassword = '';
		this.newPassword = '';
		this.confirmPassword = '';
	}
	calculateAge(dob: string) {
		if (dob === '0001-01-01T00:00:00Z') {
			return null;
		}
		var dateOfBirth = new Date(dob);
		var diff_ms = Date.now() - dateOfBirth.getTime();
		var age_dt = new Date(diff_ms);

		return Math.abs(age_dt.getUTCFullYear() - 1970);
	}
	keytab(event) {
		if (event.currentTarget.value === '') {
			return;
		}
		let element = event.srcElement.nextElementSibling; // get the sibling element

		if (element == null) {
			return;
		} else {
			element.focus();
		}
	}
}
