import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { QuestionRequestService } from 'src/app/_services/questionRequest.service';
import { QuesRequest } from 'src/app/_dto/ques-request.dto';
import { UtilityService } from 'src/app/_services/utility.service';
import { RoleType, QuestionStatus } from 'src/app/_models/enums';
import { Question } from 'src/app/_models/question.model';
import { Observable } from 'rxjs';
import { Standard } from 'src/app/_models/standard.model';
import { Subject } from 'src/app/_models/subject.model';
import { Group } from 'src/app/_models/group.model';
import { GroupService } from 'src/app/_services/group.service';
import { QuestionResponseDto } from 'src/app/_dto/question-response.dto';

@Component({
	selector: 'app-view-requests',
	templateUrl: './view-requests.component.html',
	styleUrls: [ './view-requests.component.css' ]
})
export class ViewRequestsComponent implements OnInit {
	imageUrl: string;
	tempImageUrl = '';
	subjectMap = new Map<string, Subject>();
	loggedInUser: User;
	pendingQuestions: Question[];
	rejectedQuestions: Question[];
	selectedQuestion: Question;
	tempSelectedQuestion: Question;
	rejectedPageIndex = 1;
	pendingPageIndex = 1;
	rejectedPageLen: number;
	pendingPageLen: number;
	pageSize = 10;
	editMode = false;
	tags: string;
	tagsSuggestions: string[];
	chaptersSuggestions: string[];
	quillHtml: string;
	toolbarOptions = [
		[ 'bold', 'italic', 'underline' ], // toggled buttons

		[ { list: 'ordered' }, { list: 'bullet' } ],
		[ { script: 'sub' }, { script: 'super' } ], // superscript/subscript

		[ { size: [ 'small', false, 'large' ] } ], // custom dropdown

		[ { align: [] } ],

		[ 'clean' ] // remove formatting button
	];
	quillModule = {
		toolbar: this.toolbarOptions
	};
	constructor(
		private localStorageService: LocalStorageService,
		private quesRequestService: QuestionRequestService,
		private utilityService: UtilityService,
		private groupService: GroupService
	) {}

	ngOnInit() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.getPendingRequests();
		this.getRejectedRequests();
		this.groupService.groupFetched.subscribe((group: Group) => {
			if (group) {
				this.createSubjectTopicMap(group);
			}
		});
	}

	createSubjectTopicMap(group: Group) {
		group.subjects.forEach((subject: Subject) => {
			this.subjectMap.set(subject.title, subject);
		});
	}
	getPendingRequests() {
		var getCount = this.pendingPageLen ? false : true;
		this.quesRequestService
			.viewQuestionRequests(
				this.createQuesRequestDto(
					this.loggedInUser,
					QuestionStatus.PENDING,
					this.pendingPageIndex - 1,
					getCount
				)
			)
			.subscribe((questionResponseDto: QuestionResponseDto) => {
				this.pendingQuestions = questionResponseDto.questions;
				if (getCount) {
					this.pendingPageLen = questionResponseDto.records;
				}
			});
	}
	getRejectedRequests() {
		var getCount = this.rejectedPageLen ? false : true;
		this.quesRequestService
			.viewQuestionRequests(
				this.createQuesRequestDto(
					this.loggedInUser,
					QuestionStatus.REJECTED,
					this.rejectedPageIndex - 1,
					getCount
				)
			)
			.subscribe((questionResponseDto: QuestionResponseDto) => {
				this.rejectedQuestions = questionResponseDto.questions;
				if (getCount) {
					this.rejectedPageLen = questionResponseDto.records;
				}
			});
	}
	createQuesRequestDto(user: User, status: QuestionStatus, pageIndex: number, getCount: boolean): QuesRequest {
		var quesRequest = new QuesRequest();
		quesRequest.userID = user.userId;
		quesRequest.groupCode = user.school.group.code;
		quesRequest.page = pageIndex;
		quesRequest.schoolID = user.school.schoolId;
		quesRequest.standards = user.roles[this.utilityService.findRoleIndex(user.roles, RoleType.TEACHER)].stds;
		quesRequest.standards.forEach((std: Standard) => {
			std.subjects.forEach((subject: Subject) => {
				subject.tags = null;
				subject.topics = null;
				subject.reviewer = null;
			});
		});
		quesRequest.status = status;
		quesRequest.getCount = getCount;

		return quesRequest;
	}

	deleteQuestion() {
		this.quesRequestService.deleteQuestionRequest(this.selectedQuestion).subscribe((response) => {
			if (response) {
				document.getElementById(this.selectedQuestion.quesId).hidden = true;
				this.selectedQuestion = null;
			}
		});
	}
	onEditClicked() {
		this.editMode = true;
		this.tempSelectedQuestion = JSON.parse(JSON.stringify(this.selectedQuestion));
		this.tags = '';
		this.quillHtml = this.tempSelectedQuestion.titleHtml;
		this.tagsSuggestions = this.subjectMap.get(this.tempSelectedQuestion.subject).tags;
		this.chaptersSuggestions = this.subjectMap.get(this.tempSelectedQuestion.subject).topics;
	}
	updateQuestion() {
		var text = document.getElementById('quillContainer').textContent;
		this.tempSelectedQuestion.title = text ? text.trim() : '';
		this.tempSelectedQuestion.titleHtml = this.quillHtml;
		if (this.tempImageUrl) {
			this.tempSelectedQuestion.imageUrl = this.tempImageUrl;
		}
		this.quesRequestService.updateQuestion(this.tempSelectedQuestion).subscribe((response) => {
			if (response) {
				this.rejectedQuestions = this.rejectedQuestions.filter(
					(q) => q.quesId !== this.selectedQuestion.quesId
				);
				this.selectedQuestion = null;
				this.editMode = false;
			}
		});
	}
	addTag(event) {
		if (this.tags && this.tags.length > 2) {
			{
				if (event.keyCode === 188 || event.keyCode === 13) {
					// normal keypress
					this.tags = this.tags.trim();
					if (this.tags.length > 1 && this.tags[this.tags.length - 1] === ',') {
						this.tags = this.tags.slice(0, this.tags.length - 1);
					}
					this.tempSelectedQuestion.tags.push(this.tags);
					this.tags = '';
				} else if (event.item) {
					// from typeahead
					this.tempSelectedQuestion.tags.push(this.tags);
					this.tagsSuggestions = this.tagsSuggestions.filter((x) => x !== this.tags);
					this.tags = '';
				} else if (event.type === 'blur') {
					//blur
					this.tags = this.tags.trim();
					this.tempSelectedQuestion.tags.push(this.tags);
					this.tagsSuggestions = this.tagsSuggestions.filter((x) => x !== this.tags);
					this.tags = '';
				}
			}
		}
	}
	removeTag(tag) {
		this.tempSelectedQuestion.tags = this.tempSelectedQuestion.tags.filter((x) => x !== tag);
		this.tagsSuggestions.push(tag);
	}
}
