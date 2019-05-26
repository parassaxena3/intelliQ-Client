import { ResponseStatus } from '../_models/enums';

export class AppResponse {
	
	constructor(public status: ResponseStatus, public msg: string, public body: any) {}
}
