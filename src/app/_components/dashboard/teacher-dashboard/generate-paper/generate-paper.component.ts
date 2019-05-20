import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user.model';
import { Standard } from 'src/app/_models/standard.model';
import { Subject } from 'src/app/_models/subject.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { UtilityService } from 'src/app/_services/utility.service';
import { RoleType, LengthType, DifficultyType } from 'src/app/_models/enums';
import { GroupService } from 'src/app/_services/group.service';
import { Group } from 'src/app/_models/group.model';
import { QuesLength, QuestionCriteria, QuesDifficulty } from 'src/app/_dto/question-criteria.dto';
import { QuestionPaperService } from 'src/app/_services/question-paper.service';
import { QuestionPaperDto, Section } from 'src/app/_dto/question-paper.dto';
import { NotificationService } from 'src/app/_services/notification.service';
import { TestDto } from 'src/app/_dto/test.dto.';
import { TestPaper } from 'src/app/_models/testpaper.model';
import { Template } from 'src/app/_models/template.model';
import { Observable } from 'rxjs';
import { Question } from 'src/app/_models/question.model';
import { QuestionService } from 'src/app/_services/question.service';

@Component({
	selector: 'app-generate-paper',
	templateUrl: './generate-paper.component.html',
	styleUrls: [ './generate-paper.component.css' ]
})
export class GeneratePaperComponent implements OnInit {
	loadedTemplate: Template;
	loadedDraft: TestPaper;
	selectedDraft = '';
	selectedTemplateId = '';
	templatesArray: Template[];
	draftsArray: TestPaper[];
	modalTag = '';
	showReplaceModal = false;
	activeTab = 'criteria';
	questionPapers: QuestionPaperDto[];
	userGroup: Group;
	loggedInUser: User;
	stdSubjectMap = new Map<number, Subject[]>();
	subjectMap = new Map<string, Subject>();
	standards: Standard[];
	selectedStd = -1;
	selectedSubject: Subject = null;
	sets = 1;
	totalMarks: number;
	activeSet = 1;
	questionToReplace: {
		quesId: string;
		std: number;
		subject: string;
		topic: string;
		difficulty: QuesDifficulty;
		length: QuesLength[];
		tags: string[];
		sectionIndex: number;
		questionIndex: number;
	};
	suggestedQuestions: Question[] = [];
	selectedReplacement: Question = null;
	difficultyLevels = this.getDifficultyLevels();
	allSections = this.getAllSections();
	chapterTxt = '';
	chapters: string[] = [];
	chapterSuggestions: string[];
	currSet: QuestionPaperDto;
	queCriteria: QuestionCriteria;
	testPaperStatus = 'draft';
	replaceCriteriaModel: { type: string; totalQues: number; marks: number };
	chaptersSuggestions: string[];

	constructor(
		private notificationService: NotificationService,
		private localStorageService: LocalStorageService,
		private groupService: GroupService,
		private utilityService: UtilityService,
		private questionPaperService: QuestionPaperService,
		private questionService: QuestionService
	) {}

	ngOnInit() {
		this.loggedInUser = this.localStorageService.getCurrentUser();
		var teacherRole = this.loggedInUser.roles[
			this.utilityService.findRoleIndex(this.loggedInUser.roles, RoleType.TEACHER)
		];
		this.createSubjectReviewerMap(teacherRole.stds);
		this.fetchGroup();
		this.fetchDraftsAndTemplates();
	}

	createSubjectReviewerMap(stds: Standard[]) {
		this.standards = stds;
		stds.forEach((std: Standard) => {
			this.stdSubjectMap.set(std.std, std.subjects);
		});
	}

	fetchGroup() {
		if (!this.userGroup) {
			this.groupService.getGroupByCode(this.loggedInUser.school.group.code).subscribe((group: Group) => {
				this.userGroup = group;
				if (this.userGroup) {
					this.createSubjectTopicMap(group);
				}
			});
		}
	}

	createSubjectTopicMap(group: Group) {
		group.subjects.forEach((subject: Subject) => {
			this.subjectMap.set(subject.title, subject);
		});
	}

	generatePaper() {
		if (!this.createQuestionCriteria(true)) {
			return;
		}
		this.questionPaperService
			.generateQuestionPaper(this.queCriteria)
			.subscribe((questionPapers: QuestionPaperDto[]) => {
				if (!questionPapers) {
					this.notificationService.showErrorWithTimeout(
						'Oops! No Questions found matching your criteria.',
						null,
						2000
					);
					return;
				}
				this.questionPapers = questionPapers.sort((a, b) => {
					return a.set - b.set;
				});
				this.questionPapers.forEach((set: QuestionPaperDto) => {
					set.sections = set.sections.sort((a, b) => {
						return a.type - b.type;
					});
				});
				this.currSet = this.questionPapers[0];

				if (this.loadedTemplate) {
					this.loadedTemplate.criteria = this.queCriteria;
				}
				this.loadedDraft = null;
				this.selectedDraft = '';
				this.activeSet = 1;
				this.activeTab = 'showPaper';
			});
	}

	createQuestionCriteria(validate: boolean) {
		var errorMsg = '';

		this.queCriteria = new QuestionCriteria(
			this.loggedInUser.school.group.code,
			this.selectedStd,
			this.selectedSubject.title,
			null
		);
		this.queCriteria.sets = Number(this.sets);
		this.queCriteria.totalMarks = this.totalMarks;
		this.queCriteria.topics = this.chapters ? this.chapters.sort() : [];
		this.queCriteria.length = [];
		this.allSections.forEach((section) => {
			if (section.checked) {
				if (validate) {
					if (section.totalQues === null || section.totalQues < 1) {
						errorMsg = 'Question count should be atleast 1 for ' + section.type;
						return;
					}
					if (section.marks === null || section.marks < 1) {
						errorMsg = 'Marks should be atleast 1 for ' + section.type;
						return;
					}
				}
				var sec = new QuesLength();
				sec.type = this.utilityService.getSectionEnum(section.type);
				sec.count = section.totalQues;
				sec.marks = section.marks;
				this.queCriteria.length.push(sec);
			}
		});
		if (errorMsg.length > 0) {
			this.notificationService.showErrorWithTimeout(errorMsg, null, 2000);
			return false;
		}
		if (this.queCriteria.length.length === 0 && validate) {
			this.notificationService.showErrorWithTimeout('Select atleast 1 Section', null, 2000);
			return false;
		}

		this.queCriteria.difficulty = [];
		var totalPercent = 0;
		this.difficultyLevels.forEach((level) => {
			if (level.checked) {
				if (validate && (level.diffPercent === null || level.diffPercent < 10)) {
					errorMsg = 'Diffculty percent must be atleast 10% for ' + level.type;
					return;
				}
				var lvl = new QuesDifficulty();
				lvl.level = this.utilityService.getDifficultyEnum(level.type);
				lvl.percent = level.diffPercent;
				this.queCriteria.difficulty.push(lvl);
				totalPercent += level.diffPercent;
			}
		});
		if (errorMsg.length > 0) {
			this.notificationService.showErrorWithTimeout(errorMsg, null, 2000);
			return false;
		}
		if (validate) {
			if (this.queCriteria.difficulty.length === 0) {
				this.notificationService.showErrorWithTimeout('Select atleast 1 Difficulty Level', null, 2000);
				return false;
			}
			if (totalPercent !== 100) {
				this.notificationService.showErrorWithTimeout('Cumulative difficulty must be 100%', null, 2000);
				return false;
			}
		}

		return true;
	}

	getActiveTabClass(set: number) {
		return set === this.activeSet;
	}

	onSetSelected(set: number) {
		this.activeSet = set;
		this.currSet = this.questionPapers[set - 1];
	}
	saveData() {
		if (this.activeTab === 'criteria') {
			this.saveTemplate();
		} else {
			this.saveTestPaper();
		}
	}
	saveTemplate() {
		var template = null;
		this.createQuestionCriteria(false);
		if (this.loadedTemplate) {
			template = this.loadedTemplate;
		} else {
			template = new Template(this.loggedInUser);
		}
		template.criteria = this.queCriteria;
		template.tag = this.modalTag;

		var testDto = new TestDto(template, null);
		this.questionPaperService.savePaper(testDto, this.testPaperStatus).subscribe((response: String) => {
			if (response) {
				var msgs = response.split(':');
				if (msgs[0] === 'Duplicate Record') {
					this.notificationService.showErrorWithTimeout('Template already exists!', null, 2000);
				} else {
					this.notificationService.showSuccessWithTimeout(msgs[0], null, 2000);
					this.fetchAllTemplates();
				}
			}
		});
	}

	saveTestPaper() {
		var testPaper: TestPaper;
		if (this.loadedDraft) {
			testPaper = this.loadedDraft;
			testPaper.tag = this.modalTag;
			testPaper.sets = this.questionPapers;
		} else {
			if (this.questionPapers) {
				testPaper = new TestPaper(this.loggedInUser);
				testPaper.std = this.selectedStd;
				testPaper.subject = this.selectedSubject.title;
				testPaper.sets = this.questionPapers;
				testPaper.tag = this.modalTag;
				testPaper.sets.forEach((set: QuestionPaperDto) => {
					set.sections.forEach((section: Section) => {
						var marks = this.allSections.find(
							(x) => this.utilityService.getSectionEnum(x.type) === section.type
						).marks;
						section.questions.forEach((question: Question) => {
							question.marks = marks;
						});
					});
				});
			}
		}
		var testDto = new TestDto(null, testPaper);
		this.questionPaperService.savePaper(testDto, this.testPaperStatus).subscribe((response: String) => {
			if (response) {
				var msgs = response.split(':');
				this.notificationService.showSuccessWithTimeout(msgs[1], null, 2000);
				this.fetchAllDrafts();
			}
			//hide modal
		});
	}
	fetchDraftsAndTemplates() {
		this.fetchAllTemplates();
		this.fetchAllDrafts();
	}
	fetchAllTemplates() {
		this.questionPaperService
			.fetchTemplates(this.loggedInUser.school.group.code, this.loggedInUser.userId)
			.subscribe((templates) => {
				this.templatesArray = templates;
			});
	}
	fetchAllDrafts() {
		this.questionPaperService
			.fetchDrafts(this.loggedInUser.school.group.code, this.loggedInUser.userId)
			.subscribe((templates) => {
				this.draftsArray = templates;
			});
	}
	fetchDraft() {
		this.questionPaperService
			.fetchDraft(this.loggedInUser.school.group.code, this.selectedDraft)
			.subscribe((draft: TestPaper) => {
				if (draft) {
					this.loadedDraft = draft;
					this.questionPapers = draft.sets.sort((a, b) => {
						return a.set - b.set;
					});
					this.questionPapers.forEach((set: QuestionPaperDto) => {
						set.sections = set.sections.sort((a, b) => {
							return a.type - b.type;
						});
					});
					this.currSet = this.questionPapers[0];
					this.activeSet = 1;
				}
			});
	}
	deleteDraft() {
		this.questionPaperService
			.deleteDraft(this.loggedInUser.school.group.code, this.selectedDraft)
			.subscribe((response) => {
				if (response) {
					this.draftsArray = this.draftsArray.filter((x) => x.testId !== this.selectedDraft);
					this.loadedDraft = null;
					this.questionPapers = null;
					this.selectedDraft = '';
				}
			});
	}
	fetchTemplate() {
		this.questionPaperService
			.fetchTemplate(this.loggedInUser.school.group.code, this.selectedTemplateId)
			.subscribe((template: Template) => {
				this.loadedTemplate = template;
				this.setTemplateForm();
			});
	}
	deleteTemplate() {
		this.questionPaperService
			.deleteTemplate(this.loggedInUser.school.group.code, this.selectedTemplateId)
			.subscribe((response) => {
				if (response) {
					this.templatesArray = this.templatesArray.filter((x) => x.templateId !== this.selectedTemplateId);
					this.resetTemplateForm();
				}
			});
	}
	setTemplateForm() {
		var template = this.loadedTemplate;
		if (template) {
			this.selectedStd = template.criteria.std;
			this.selectedSubject = this.stdSubjectMap
				.get(this.selectedStd)
				.find((x) => x.title === template.criteria.subject);
			this.sets = template.criteria.sets;
			this.totalMarks = template.criteria.totalMarks;
			this.chapters = template.criteria.topics;

			this.difficultyLevels = this.getDifficultyLevels();
			template.criteria.difficulty.forEach((difficulty: QuesDifficulty) => {
				this.difficultyLevels[difficulty.level].checked = true;
				this.difficultyLevels[difficulty.level].diffPercent = difficulty.percent;
			});

			this.allSections = this.getAllSections();
			template.criteria.length.forEach((section: QuesLength) => {
				this.allSections[section.type].checked = true;
				this.allSections[section.type].totalQues = section.count;
				this.allSections[section.type].marks = section.marks;
			});

			this.chapterSuggestions = this.selectedSubject
				? this.subjectMap.get(this.selectedSubject.title).topics
				: [];

			this.chapters.forEach((chapter) => {
				this.chapterSuggestions = this.chapterSuggestions.filter((x) => x !== chapter);
			});
		}
	}
	resetTemplateForm() {
		this.allSections = this.getAllSections();
		this.difficultyLevels = this.getDifficultyLevels();
		this.loadedTemplate = null;
		this.selectedTemplateId = '';
		this.selectedStd = -1;
		this.selectedSubject = null;
		this.sets = 1;
		this.totalMarks = null;
		this.chapters = [];
		this.queCriteria = null;
	}
	replaceClicked(pIndex: number, cIndex: number, question: Question) {
		this.questionToReplace = {
			quesId: '',
			std: 0,
			subject: '',
			topic: '',
			difficulty: null,
			length: [],
			tags: [],
			sectionIndex: 0,
			questionIndex: 0
		};
		if (this.loadedDraft) {
			this.questionToReplace.std = this.loadedDraft.std;
			this.questionToReplace.subject = this.loadedDraft.subject;
		} else {
			this.questionToReplace.std = this.selectedStd;
			this.questionToReplace.subject = this.selectedSubject.title;
		}
		this.questionToReplace.difficulty = new QuesDifficulty();
		this.questionToReplace.difficulty.level = question.difficulty;
		var queLength = new QuesLength();
		queLength.type = question.length; // count?
		this.questionToReplace.length = [ queLength ];
		this.questionToReplace.sectionIndex = pIndex;
		this.questionToReplace.questionIndex = cIndex;
		this.questionToReplace.quesId = question.quesId;
		this.suggestedQuestions = []; //for replace
		this.selectedReplacement = null;
		this.showReplaceModal = true;
	}
	replaceQuestion(question: Question) {
		this.selectedReplacement = question;
		this.selectedReplacement.marks = this.questionPapers[this.activeSet - 1].sections[
			this.questionToReplace.sectionIndex
		].questions[this.questionToReplace.questionIndex].marks;
		this.questionPapers[this.activeSet - 1].sections[this.questionToReplace.sectionIndex].questions[
			this.questionToReplace.questionIndex
		] = this.selectedReplacement;
		//this.notificationService.showSuccessWithTimeout('Question replaced!', null, 2000);
		this.showReplaceModal = false;
		this.questionToReplace = null;
	}
	showReplaceSuggestion() {
		if (this.questionToReplace.topic.length === 0) {
			this.notificationService.showErrorWithTimeout('Please Select Topic!', null, 2000);
			return;
		}
		var queCriteria = new QuestionCriteria(
			this.loggedInUser.school.group.code,
			this.questionToReplace.std,
			this.questionToReplace.subject,
			null
		);
		queCriteria.difficulty = [ this.questionToReplace.difficulty ];
		queCriteria.length = this.questionToReplace.length;
		queCriteria.tags = this.questionToReplace.tags;
		queCriteria.topics = [ this.questionToReplace.topic ];
		this.questionService.getFilteredQuestion(queCriteria).subscribe((questions: Question[]) => {
			questions = questions.filter((x) => x.quesId !== this.questionToReplace.quesId);
			this.suggestedQuestions = [];
			if (questions.length > 0) {
				this.suggestedQuestions = questions;
			} else {
				this.notificationService.showErrorWithTimeout(
					'Oops! No Questions found matching your criteria.',
					null,
					2000
				);
			}
		});
	}
	setModalTitle(type: string) {
		if (type === 'template') {
			this.modalTag = this.loadedTemplate ? this.loadedTemplate.tag : '';
		} else {
			this.modalTag = this.loadedDraft ? this.loadedDraft.tag : '';
		}
	}

	addChapter(event) {
		if (event.item) {
			this.chapters.push(event.item);
			this.chapterSuggestions = this.chapterSuggestions.filter((x) => x !== event.item);
			this.chapterTxt = '';
		}
	}
	removeChapter(chapter: string) {
		this.chapters = this.chapters.filter((x) => x !== chapter);
		this.chapterSuggestions.push(chapter);
	}

	addChapterReplace(event) {
		if (event.item) {
			this.questionToReplace.topic = event.item;
		}
	}
	addTopicReplace(event) {
		if (event.item) {
			this.questionToReplace.tags.push(event.item);
		}
	}
	removeTopicReplace(topic: string) {
		this.questionToReplace.tags = this.questionToReplace.tags.filter((x) => x !== topic);
	}
	onSubjectChanged() {
		this.chapterSuggestions = this.selectedSubject ? this.subjectMap.get(this.selectedSubject.title).topics : [];
		this.chapters = [];
	}
	getAllSections() {
		return [
			{ type: 'Objective', checked: false, totalQues: null, marks: null },
			{ type: 'Short', checked: false, totalQues: null, marks: null },
			{ type: 'Brief', checked: false, totalQues: null, marks: null },
			{ type: 'Long', checked: false, totalQues: null, marks: null }
		];
	}
	getDifficultyLevels() {
		return [
			{ type: 'Easy', checked: false, diffPercent: null },
			{ type: 'Medium', checked: false, diffPercent: null },
			{ type: 'Hard', checked: false, diffPercent: null }
		];
	}
}
