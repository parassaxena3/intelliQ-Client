import { Injectable } from '@angular/core';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppResponse } from '../_dto/app-response.model';
import { ResponseStatus } from '../_models/enums';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class RestService {
	baseUrl: string;
	httpOptions: any;

	constructor(private spinner: NgxSpinnerService, private http: HttpClient, private cookieService: CookieService) {
		this.baseUrl = 'https://35.200.183.136:8080/';
	}

	createOptions(body?: any, customHeader?: string) {
		var xsrf = this.cookieService.get('XSRF-TOKEN');
		if (!xsrf) {
			xsrf = '';
		}
		if (!customHeader) {
			this.httpOptions = {
				headers: new HttpHeaders({ 'X-Xsrf-Token': xsrf }),
				withCredentials: true,
				body: body
			};
		} else {
			this.httpOptions = {
				headers: new HttpHeaders({ 'X-Xsrf-Token': xsrf, rqst_otp_sess_id: customHeader }),
				withCredentials: true,
				body: body
			};
		}
	}

	get(method: string, customHeader?: string) {
		this.spinner.show();
		this.createOptions(null, customHeader);
		return this.http.get(this.baseUrl + method, this.httpOptions).pipe(
			catchError((error: HttpErrorResponse) => {
				console.log(error);
				return of(this.prepareAppResponse(error));
			}),
			finalize(() => {
				this.spinner.hide();
			})
		);
	}

	post(method: string, body: any, hideSpinner?: boolean) {
		if (hideSpinner !== true) {
			this.spinner.show();
		}
		this.createOptions();
		return this.http.post(this.baseUrl + method, body, this.httpOptions).pipe(
			catchError((error: HttpErrorResponse) => {
				console.log(error);
				return of(this.prepareAppResponse(error));
			}),
			finalize(() => {
				this.spinner.hide();
			})
		);
	}

	put(method: string, body: any) {
		this.spinner.show();
		this.createOptions();
		return this.http.put(this.baseUrl + method, body, this.httpOptions).pipe(
			catchError((error: HttpErrorResponse) => {
				console.log(error);
				return of(this.prepareAppResponse(error));
			}),
			finalize(() => {
				this.spinner.hide();
			})
		);
	}

	delete(method: string, body?: any) {
		this.spinner.show();
		this.createOptions(body);
		return this.http.delete(this.baseUrl + method, this.httpOptions).pipe(
			catchError((error: HttpErrorResponse) => {
				console.log(error);
				return of(this.prepareAppResponse(error));
			}),
			finalize(() => {
				this.spinner.hide();
			})
		);
	}

	prepareAppResponse(error: HttpErrorResponse) {
		if (error.status === ResponseStatus.FORBIDDEN) {
			return new AppResponse(ResponseStatus.FORBIDDEN, error.error, null);
		}
		var msg = error.error.msg ? error.error.msg : 'Something went wrong!';
		return new AppResponse(ResponseStatus.ERROR, msg, null);
	}
}
