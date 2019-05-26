import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { User } from 'src/app/_models/user.model';
import { ResponseStatus } from 'src/app/_models/enums';
import { UserService } from 'src/app/_services/user.service';
import { AppResponse } from 'src/app/_dto/app-response.model';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	private mobile = '1111111111';
	private password = 'pwd12345';
	private returnUrl: string;
	constructor(
		private authenticationService: AuthenticationService,
		private router: Router,
		private route: ActivatedRoute,
		private userService: UserService,
		private notificationService: NotificationService
	) {}

	ngOnInit() {
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/roles';
		this.userService.userDetailsUpdated.next(null);
	}

	onSubmit() {
		var user = new User();
		user.mobile = this.mobile;
		user.password = this.password;
		this.authenticationService.login(user).subscribe((appResponse: AppResponse) => {
			if (appResponse.status === ResponseStatus.ERROR) {
				this.notificationService.showErrorWithTimeout(appResponse.msg, null, 2000);
			} else if (appResponse.status === ResponseStatus.SUCCESS) {
				this.authenticationService.persistUser(appResponse.body);
				this.router.navigate([ this.returnUrl ]);
			}
		});
	}
}
