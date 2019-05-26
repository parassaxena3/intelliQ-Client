import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { UtilityService } from 'src/app/_services/utility.service';

@Component({
	selector: 'app-role-selection',
	templateUrl: './role-selection.component.html',
	styleUrls: [ './role-selection.component.css' ],
	changeDetection: ChangeDetectionStrategy.Default
})
export class RoleSelectionComponent implements OnInit, OnDestroy {
	userSubscription: Subscription;
	roles: string[];
	constructor(private userService: UserService, private router: Router) {}

	ngOnInit() {
		this.initiateSubscriptions();
	}

	initiateSubscriptions(): any {
		this.userSubscription = this.userService.userDetailsUpdated.subscribe((user: User) => {
			this.roles = this.userService.getUserRoles();
		});
	}

	onRoleSelected(type: string) {
		this.userService.userRoleUpdated.next(type);
		this.router.navigate([ 'dashboard', type.toLowerCase() ]);
	}

	ngOnDestroy() {
		this.userSubscription.unsubscribe();
	}
	getClassForRole(role) {
		switch (role) {
			case 'group-admin':
				return 'bg-modify';
			case 'school-admin':
				return 'bg-remove';
			case 'reviewer':
				return 'bg-new';
			case 'teacher':
				return 'bg-blue';
			case 'super-admin':
				return 'bg-modify';
		}
	}
}
