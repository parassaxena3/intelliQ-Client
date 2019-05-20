import { Component, OnInit } from '@angular/core';
import { QuestionPaperService } from 'src/app/_services/question-paper.service';
import { User } from 'src/app/_models/user.model';
import { TestPaper } from 'src/app/_models/testpaper.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { QuestionPaperDto } from 'src/app/_dto/question-paper.dto';
import { UtilityService } from 'src/app/_services/utility.service';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObjFilter } from 'src/app/_dto/filter.dto';

@Component({
	selector: 'app-view-question-paper',
	templateUrl: './view-question-paper.component.html',
	styleUrls: [ './view-question-paper.component.css' ]
})
export class ViewQuestionPaperComponent implements OnInit {
	objFilters: ObjFilter[];
	loggedInUser: User;
	papers: TestPaper[];
	loadedPaper: TestPaper;
	activeSet = 1;
	currSet: QuestionPaperDto;
	questionPapers: QuestionPaperDto[];

	constructor(
		private localStorageService: LocalStorageService,
		private utilityService: UtilityService,
		private questionPaperService: QuestionPaperService,
		private spinner: NgxSpinnerService
	) {}

	ngOnInit() {
		this.objFilters = [ new ObjFilter(), new ObjFilter() ];
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.fetchAllPapers();
	}
	updateFilters(key, value, index: number) {
		debugger;
		this.objFilters[index] = { key: key, value: value };
	}
	fetchAllPapers() {
		this.questionPaperService
			.fetchPapers(this.loggedInUser.school.group.code, this.loggedInUser.userId)
			.subscribe((templates) => {
				this.papers = templates;
			});
	}
	fetchPaper(paperId) {
		this.questionPaperService
			.fetchDraft(this.loggedInUser.school.group.code, paperId)
			.subscribe((paper: TestPaper) => {
				if (paper) {
					this.loadedPaper = paper;
					this.questionPapers = paper.sets.sort((a, b) => {
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
	getActiveTabClass(set: number) {
		return set === this.activeSet;
	}
	onSetSelected(set: number) {
		this.activeSet = set;
		this.currSet = this.questionPapers[set - 1];
	}
	printPaper() {
		var data = document.getElementById('contentToConvert');

		this.spinner.show();
		html2canvas(data).then((canvas) => {
			var imgWidth = 210;
			var pageHeight = 295;
			var imgHeight = canvas.height * imgWidth / canvas.width;
			var heightLeft = imgHeight;

			var doc = new jspdf('p', 'mm', 'a4');
			var position = 0;
			const contentDataURL = canvas.toDataURL('image/png');
			doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				doc.addPage();
				doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}
			doc.save(this.loadedPaper.tag + '.pdf');
			this.spinner.hide();
		});

		// var data = document.getElementById('contentToConvert');
		// this.spinner.show();
		// html2canvas(data).then((canvas) => {
		// 	// Few necessary setting options
		// 	var imgWidth = 208;
		// 	var pageHeight = 295;
		// 	var imgHeight = canvas.height * imgWidth / canvas.width;
		// 	var heightLeft = imgHeight;

		// 	const contentDataURL = canvas.toDataURL('image/png');
		// 	var pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
		// 	var position = 0;
		// 	pdf.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
		// 	pdf.save(this.loadedPaper.tag + '.pdf'); // Generated PDF
		// 	this.spinner.hide();
		// });
	}

	removePaper(paperId: string) {
		this.questionPaperService.deleteDraft(this.loggedInUser.school.group.code, paperId).subscribe((response) => {
			if (response) {
				this.papers = this.papers.filter((x) => x.testId !== paperId);
			}
		});
	}
}
