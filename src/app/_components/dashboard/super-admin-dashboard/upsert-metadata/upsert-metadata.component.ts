import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MetaService } from 'src/app/_services/meta.service';
import { Meta } from 'src/app/_models/meta.model';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
	selector: 'app-upsert-metadata',
	templateUrl: './upsert-metadata.component.html',
	styleUrls: [ './upsert-metadata.component.css' ]
})
export class UpsertMetadataComponent implements OnInit {
	addMetadataForm: FormGroup;
	metadata: Meta;
	metadataLoaded = false;
	metaSubscription: Subscription;
	deleteMetadata: Meta;
	isDirty = false;
	constructor(
		private formBuilder: FormBuilder,
		private metaService: MetaService,
		private notificationService: NotificationService
	) {
		this.deleteMetadata = new Meta();
	}

	ngOnInit() {
		this.addMetadataForm = this.formBuilder.group({
			subjects: '',
			standards: ''
		});

		this.getMetaData();
	}
	onSubmit() {
		var standardsStr = this.addMetadataForm.get('standards').value;
		var subjectsStr = this.addMetadataForm.get('subjects').value;
		var standards: number[];
		var subjects: string[];
		if (!standardsStr && !subjectsStr) {
			this.notificationService.showErrorWithTimeout('Please enter values!', null, 2000);
			return;
		} else if (subjectsStr && (subjectsStr[0] === ',' || subjectsStr[subjectsStr.length - 1] === ',')) {
			this.notificationService.showErrorWithTimeout('Please remove extra comma!', null, 2000);
			return;
		}
		if (subjectsStr) {
			subjects = this.metadata ? this.metadata.subjects.concat(subjectsStr.split(',')) : subjectsStr.split(',');
		} else {
			subjects = this.metadata ? this.metadata.subjects : [];
		}
		if (standardsStr) {
			var temp = standardsStr.split(',').map(function(item: string) {
				return parseInt(item, 10);
			});
			if (temp.length > 0 && isNaN(temp[0])) {
				this.notificationService.showErrorWithTimeout('Please enter valid standard!', null, 2000);
				return;
			}
			standards = this.metadata ? this.metadata.standards.concat(temp) : temp;
		} else {
			standards = this.metadata ? this.metadata.standards : [];
		}

		var meta = new Meta();
		meta.subjects = subjects;
		meta.standards = standards;
		if (this.metadata) {
			meta.metaId = this.metadata.metaId;
			this.metaService.updateMeta(meta).subscribe(() => {
				this.getMetaData();
			});
		} else {
			this.metaService.addMeta(meta).subscribe(() => {
				this.getMetaData();
			});
		}
	}

	getMetaData() {
		this.metaSubscription = this.metaService.getMeta().subscribe((metadata: Meta) => {
			this.metadataLoaded = true;
			this.metadata = metadata;
			this.deleteMetadata.metaId = this.metadata ? this.metadata.metaId : null;
			this.deleteMetadata.standards = [];
			this.deleteMetadata.subjects = [];
		});
	}
	removeStandard(value) {
		this.metadata.standards = this.metadata.standards.filter((item) => item !== value);
		this.deleteMetadata.standards.push(value);
		this.isDirty = true;
	}
	removeSubject(value) {
		this.metadata.subjects = this.metadata.subjects.filter((item) => item !== value);
		this.deleteMetadata.subjects.push(value);
		this.isDirty = true;
	}
	deleteMeta() {
		this.metaService.deleteMeta(this.deleteMetadata).subscribe((response) => {
			if (response) {
				this.deleteMetadata.subjects = [];
				this.deleteMetadata.standards = [];
			} else {
				this.getMetaData();
			}
			this.isDirty = false;
		});
	}
}
