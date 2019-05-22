import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { User } from 'src/app/_models/user.model';
import { Subject } from 'src/app/_models/subject.model';
import { RoleType } from 'src/app/_models/enums';
import { Standard } from 'src/app/_models/standard.model';
import { NotificationService } from 'src/app/_services/notification.service';
import { Question, Contributer } from 'src/app/_models/question.model';
import { School } from 'src/app/_models/school.model';
import { QuestionRequestService } from 'src/app/_services/questionRequest.service';
import { UtilityService } from 'src/app/_services/utility.service';
import { QuestionCriteria } from 'src/app/_dto/question-criteria.dto';
import { QuestionService } from 'src/app/_services/question.service';
import { Quill } from 'quill';
import { Group } from 'src/app/_models/group.model';
import { GroupService } from 'src/app/_services/group.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgForm } from '@angular/forms';
@Component({
	selector: 'app-add-question',
	templateUrl: './add-question.component.html',
	styleUrls: [ './add-question.component.css' ]
})
export class AddQuestionComponent implements OnInit {
	showMath = false;
	genericIntegrationInstance: any;
	imageUrl: Observable<string>;
	task: AngularFireUploadTask;
	selectedFile: File;
	quill: Quill;
	quillHtml: string;
	lastSearchTerm: string;
	loggedInUser: User;
	stdSubjectMap = new Map<number, Subject[]>();
	subjectMap = new Map<string, Subject>();
	standards: Standard[];
	question = new Question();
	selectedStd: number = null;
	selectedSubject: Subject = null;
	tags = '';
	suggestedQuestions: Question[];
	tagsSuggestions: string[];
	chaptersSuggestions: string[];
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
	@ViewChild('fileInput') fileInput: ElementRef;
	constructor(
		private localStorageService: LocalStorageService,
		private notificationService: NotificationService,
		private quesRequestService: QuestionRequestService,
		private utilityService: UtilityService,
		private quesService: QuestionService,
		private groupService: GroupService,
		private storage: AngularFireStorage,
		private spinner: NgxSpinnerService
	) {}

	ngOnInit() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		var teacherRole = this.loggedInUser.roles[
			this.utilityService.findRoleIndex(this.loggedInUser.roles, RoleType.TEACHER)
		];
		this.createSubjectReviewerMap(teacherRole.stds);
		this.groupService.groupFetched.subscribe((group: Group) => {
			if (group) {
				this.createSubjectTopicMap(group);
			}
		});
		//window.initiateMathEditor();
	}
	toggleEditor() {
		this.showMath = !this.showMath;
	}
	createSubjectTopicMap(group: Group) {
		group.subjects.forEach((subject: Subject) => {
			this.subjectMap.set(subject.title, subject);
		});
	}
	createSubjectReviewerMap(stds: Standard[]) {
		this.standards = stds.sort((a, b) => a.std - b.std);
		stds.forEach((std: Standard) => {
			this.stdSubjectMap.set(std.std, std.subjects);
		});
	}

	checkReviewer() {
		if (!this.selectedSubject.reviewer.userId) {
			this.notificationService.showErrorWithTimeout(
				'No Reviewer found for ' + this.selectedSubject.title + '.',
				null,
				2000
			);
		}
		this.question = new Question();
		this.question.tags = [];
		this.tags = '';
		this.quillHtml = '';
		this.tagsSuggestions = this.subjectMap.get(this.selectedSubject.title).tags;
		this.chaptersSuggestions = this.subjectMap.get(this.selectedSubject.title).topics;
	}
	onFileSelected(event) {
		this.selectedFile = event.target.files[0];
		if (this.selectedFile.type.split('/')[0] !== 'image') {
			this.notificationService.showErrorWithTimeout('Only image files are supported!', null, 2000);
			this.fileInput.nativeElement.value = '';
			this.selectedFile = null;
		}
	}
	addQuestion() {
		if (this.selectedFile) {
			const path =
				'intelliq/' +
				this.loggedInUser.school.group.code +
				'/' +
				this.selectedStd +
				'/' +
				this.selectedSubject.title +
				'/' +
				new Date().getTime() +
				'_' +
				`${new Date().getTime()}_${this.selectedFile.name}`;
			this.spinner.show();
			this.task = this.storage.upload(path, this.selectedFile);
			const ref = this.storage.ref(path);
			//this.uploadPercent = this.task.percentageChanges();
			this.task
				.snapshotChanges()
				.pipe(
					finalize(() => {
						this.imageUrl = ref.getDownloadURL();
						this.imageUrl.subscribe((imageUrl) => {
							this.saveQuestion(imageUrl);
						});
					})
				)
				.subscribe();
		} else {
			this.saveQuestion(null);
		}
	}
	saveQuestion(imageUrl) {
		var text = document.getElementById('quillContainer').textContent;
		this.question.title = text ? text.trim() : '';

		//this.question.titleHtml = this.showMath ? window.getMathML() : this.quillHtml;
		this.question.titleHtml = this.quillHtml;
		this.question.groupCode = this.loggedInUser.school.group.code;
		this.question.owner = new Contributer(this.loggedInUser.userId, this.loggedInUser.userName);
		this.question.reviewer = new Contributer(
			this.selectedSubject.reviewer.userId,
			this.selectedSubject.reviewer.userName
		);
		this.question.school = this.getSchool(this.loggedInUser.school);
		this.question.std = this.selectedStd;
		this.question.subject = this.selectedSubject.title;
		this.question.imageUrl = imageUrl;
		this.quesRequestService.addQuestion(this.question).subscribe((response) => {
			this.quillHtml = '';
			this.question.imageUrl = '';
			this.fileInput.nativeElement.value = null;
			this.selectedFile = null;
			this.question.tags = [];
			this.tags = '';
			//this.resetForm();
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
					this.question.tags.push(this.tags);
					this.tags = '';
				} else if (event.item) {
					// from typeahead
					this.question.tags.push(this.tags);
					this.tagsSuggestions = this.tagsSuggestions.filter((x) => x !== this.tags);
					this.tags = '';
				} else if (event.type === 'blur') {
					//blur
					this.tags = this.tags.trim();
					this.question.tags.push(this.tags);
					this.tagsSuggestions = this.tagsSuggestions.filter((x) => x !== this.tags);
					this.tags = '';
				}
			}
		}
	}
	removeTag(tag) {
		this.question.tags = this.question.tags.filter((x) => x !== tag);
		this.tagsSuggestions.push(tag);
	}
	getSchool(school: School) {
		var scl = new School();
		scl.schoolId = school.schoolId;
		scl.code = school.code;
		scl.shortName = school.shortName;
		scl.address = school.address;
		return scl;
	}
	resetForm(addQuesForm: NgForm) {
		addQuesForm.form.reset();
		this.question = new Question();
		this.question.tags = [];
		this.fileInput.nativeElement.value = null;
		this.selectedFile = null;
	}
	getSuggestions(event) {
		var text = document.getElementById('quillContainer').textContent;
		var searchTerm = text ? text.trim() : '';
		if (event.keyCode !== 32) {
			if (searchTerm.length < 3) {
				this.suggestedQuestions = [];
				this.lastSearchTerm = '';
			}
			return;
		}
		if (searchTerm.length > 2 && this.lastSearchTerm !== searchTerm) {
			var questionCriteria = new QuestionCriteria(
				this.loggedInUser.school.group.code,
				this.selectedStd,
				this.selectedSubject.title,
				searchTerm
			);
			this.quesService.getSuggestions(questionCriteria).subscribe((questions: Question[]) => {
				this.suggestedQuestions = questions;
				this.lastSearchTerm = searchTerm;
			});
		}
	}
}
