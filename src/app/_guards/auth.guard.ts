import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authSevice: AuthenticationService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {
		if (this.authSevice.isAuthenticated()) {
			return true;
		} else {
			this.authSevice.logout(false);
			this.router.navigate([ '/login' ], { queryParams: { returnUrl: state.url } });
			return false;
		}
	}
}
