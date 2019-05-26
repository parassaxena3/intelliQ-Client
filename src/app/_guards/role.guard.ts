import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../_services/local-storage.service';
import { RoleType } from '../_models/enums';
import { UserService } from '../_services/user.service';

@Injectable({
	providedIn: 'root'
})
export class RoleGuard implements CanActivate {
	constructor(
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {
		var user = this.localStorageService.getCurrentUser();
		var isAuthenticated: boolean;

		switch (route.routeConfig.component.name) {
			case 'SuperAdminDashboardComponent':
				isAuthenticated = user.roles.findIndex((role) => role.roleType === RoleType.SUPERADMIN) !== -1;
				break;
			case 'GroupAdminDashboardComponent':
				isAuthenticated = user.roles.findIndex((role) => role.roleType === RoleType.GROUPADMIN) !== -1;
				break;
			case 'SchoolAdminDashboardComponent':
				isAuthenticated = user.roles.findIndex((role) => role.roleType === RoleType.SCHOOLADMIN) !== -1;
				break;
			case 'ReviewerDashboardComponent':
				isAuthenticated = user.roles.findIndex((role) => role.roleType === RoleType.REVIEWER) !== -1;
				break;
			case 'TeacherDashboardComponent':
			case 'TimetableComponent':
				isAuthenticated = user.roles.findIndex((role) => role.roleType === RoleType.TEACHER) !== -1;
				break;
			case 'SchoolProfileComponent':
				isAuthenticated =
					user.roles.findIndex(
						(role) =>
							role.roleType === RoleType.TEACHER ||
							role.roleType === RoleType.SCHOOLADMIN ||
							role.roleType === RoleType.REVIEWER
					) !== -1;
		}
		if (!isAuthenticated) {
			this.userService.userRoleUpdated.next(null);
			this.router.navigate([ '/roles' ]);
		}
		return isAuthenticated;
	}
}
