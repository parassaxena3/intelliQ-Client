import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { QuestionPaperService } from 'src/app/_services/question-paper.service';
import { User } from 'src/app/_models/user.model';
import { TestPaper } from 'src/app/_models/testpaper.model';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { QuestionPaperDto } from 'src/app/_dto/question-paper.dto';
import { UtilityService } from 'src/app/_services/utility.service';
// import * as jspdf from 'jspdf';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObjFilter } from 'src/app/_dto/filter.dto';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
	selector: 'app-view-question-paper',
	templateUrl: './view-question-paper.component.html',
	styleUrls: [ './view-question-paper.component.css' ]
})
export class ViewQuestionPaperComponent implements OnInit {
	paperToRemove: string;
	standards: Set<number>;
	subjects: Set<string>;
	objFilters: ObjFilter[];
	loggedInUser: User;
	papers: TestPaper[];
	loadedPaper: TestPaper;
	activeSet = 1;
	currSet: QuestionPaperDto;
	questionPapers: QuestionPaperDto[];
	modalRef: BsModalRef;
	@ViewChild('contentToConvert') contentToConvert: ElementRef;
	constructor(
		private localStorageService: LocalStorageService,
		private utilityService: UtilityService,
		private questionPaperService: QuestionPaperService,
		private spinner: NgxSpinnerService,
		private modalService: BsModalService
	) {}

	ngOnInit() {
		this.objFilters = [ new ObjFilter(), new ObjFilter() ];
		this.subjects = new Set();
		this.standards = new Set();
		this.loggedInUser = this.localStorageService.getCurrentUser();
		this.fetchAllPapers();
	}
	updateFilters(key: string, value: any, index: number) {
		if (index === 0) {
			value = Number(value);
		}
		this.objFilters[index] = { key: key, value: value };
		this.objFilters = JSON.parse(JSON.stringify(this.objFilters));
	}
	fetchAllPapers() {
		this.questionPaperService
			.fetchPapers(this.loggedInUser.school.group.code, this.loggedInUser.userId)
			.subscribe((templates) => {
				var tempArray = [];
				this.papers = templates;
				this.papers.forEach((paper) => {
					tempArray.push(paper.std);
					this.subjects.add(paper.subject);
				});
				this.standards = new Set(tempArray.sort());
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
	downloadPdf() {
		var hdr;
		let doc = new jsPDF.default();
		this.loadedPaper.sets.forEach((set: QuestionPaperDto) => {
			hdr = document.createElement('h3');
			var node = document.createTextNode('Set ' + set.set);
			hdr.appendChild(node);
		});
		//doc.addHTML().fromHTML(hdr, 15, 15);
		doc.save('mypdf.pdf');
	}
	printPaper() {
		// let doc = new jsPDF.default();
		//	let content = this.contentToConvert.nativeElement;
		var data = document.getElementById('contentToConvert');

		this.spinner.show();
		html2canvas(data).then((canvas) => {
			debugger;
			var imgWidth = 210;
			var pageHeight = 295;
			var imgHeight = canvas.height * imgWidth / canvas.width;
			var heightLeft = imgHeight;

			var doc = new jsPDF.default('p', 'mm', 'a4');
			// var options = {
			// 	pagesplit: true
			// };
			var position = 0;
			const contentDataURL = canvas.toDataURL('image/png');
			doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
			// doc.addHTML(data, function() {
			// 	doc.save('test.pdf');
			// });
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

	removePaper(template: TemplateRef<any>, paperId: string) {
		this.paperToRemove = paperId;
		this.modalRef = this.modalService.show(template, {
			class: 'modal-md modal-dialog-centered'
		});
	}

	confirm(): void {
		this.questionPaperService
			.deleteDraft(this.loggedInUser.school.group.code, this.paperToRemove)
			.subscribe((response) => {
				if (response) {
					this.papers = this.papers.filter((x) => x.testId !== this.paperToRemove);
				}
			});
		this.modalRef.hide();
	}

	decline(): void {
		this.modalRef.hide();
	}
}
