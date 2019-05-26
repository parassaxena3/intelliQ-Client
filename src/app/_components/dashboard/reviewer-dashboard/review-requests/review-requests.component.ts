import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { QuestionRequestService } from 'src/app/_services/questionRequest.service';
import { QuesRequest } from 'src/app/_dto/ques-request.dto';
import { UtilityService } from 'src/app/_services/utility.service';
import { RoleType, QuestionStatus } from 'src/app/_models/enums';
import { Question } from 'src/app/_models/question.model';
import { Observable } from 'rxjs';
import { QuestionService } from 'src/app/_services/question.service';
import { QuestionResponseDto } from 'src/app/_dto/question-response.dto';

@Component({
	selector: 'app-review-requests',
	templateUrl: './review-requests.component.html',
	styleUrls: [ './review-requests.component.css' ]
})
export class ReviewRequestsComponent implements OnInit {
	rejectReason: string;
	loggedInUser: User;
	pendingRequests: Question[];
	selectedQuestion: Question;
	originalQuestion: Question;
	pageIndex = 1;
	reqLen: number;
	pageSize = 20;
	constructor(
		private localStorageService: LocalStorageService,
		private quesRequestService: QuestionRequestService,
		private utilityService: UtilityService,
		private quesService: QuestionService
	) {}

	ngOnInit() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.getReviewerRequests();
	}
	getReviewerRequests() {
		var getCount = this.reqLen ? false : true;
		this.quesRequestService
			.viewReviewerRequests(
				this.createQuesRequestDto(this.loggedInUser, QuestionStatus.PENDING, this.pageIndex - 1, getCount)
			)
			.subscribe((questionResponseDto: QuestionResponseDto) => {
				this.pendingRequests = questionResponseDto.questions;
				if (getCount) {
					this.reqLen = questionResponseDto.records;
				}
			});
	}
	createQuesRequestDto(user: User, status: QuestionStatus, pageIndex: number, getCount: boolean): QuesRequest {
		var quesRequest = new QuesRequest();
		quesRequest.userID = user.userId;
		quesRequest.groupCode = user.school.group.code;
		quesRequest.page = pageIndex;
		quesRequest.schoolID = user.school.schoolId;
		quesRequest.standards = user.roles[this.utilityService.findRoleIndex(user.roles, RoleType.REVIEWER)].stds;
		quesRequest.status = status;
		quesRequest.getCount = getCount;
		return quesRequest;
	}
	getClassForStatus(status: QuestionStatus) {
		switch (status) {
			case QuestionStatus.NEW:
				return 'panel panel-info';
			case QuestionStatus.TRANSIT:
				return 'panel panel-warning';
			case QuestionStatus.REMOVE:
				return 'panel panel-danger';
			case QuestionStatus.REJECTED:
				return 'panel panel-danger';
			case QuestionStatus.APPROVED:
				return 'panel panel-success';
		}
	}

	approveRequest() {
		this.quesRequestService.approveQuestionRequest(this.selectedQuestion).subscribe((response) => {
			if (response) {
				this.pendingRequests = this.pendingRequests.filter((q) => q.quesId !== this.selectedQuestion.quesId);
				this.selectedQuestion = null;
			}
		});
	}

	rejectRequest() {
		if (!this.rejectReason) {
			return;
		}
		this.selectedQuestion.rejectDesc = this.rejectReason;
		this.quesRequestService.rejectQuestionRequest(this.selectedQuestion).subscribe((response) => {
			if (response) {
				this.pendingRequests = this.pendingRequests.filter((q) => q.quesId !== this.selectedQuestion.quesId);
				this.selectedQuestion = null;
				this.rejectReason = '';
			}
		});
	}

	compareRequest() {
		this.originalQuestion = null;
		this.quesService
			.fetchQuestion(this.selectedQuestion.groupCode, this.selectedQuestion.originId)
			.subscribe((response) => {
				if (response) {
					this.originalQuestion = response;
				}
			});
	}

	onQuestionChanged(question: Question) {
		this.selectedQuestion = question;
		this.rejectReason = '';
	}
	getDifference(attribute: string) {
		if (
			this.selectedQuestion &&
			this.originalQuestion &&
			JSON.stringify(this.selectedQuestion[attribute]) !== JSON.stringify(this.originalQuestion[attribute])
		) {
			return 'difference-question';
		}
	}
}
