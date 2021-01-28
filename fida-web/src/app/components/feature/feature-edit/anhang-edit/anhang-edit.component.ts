import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import AttachmentInfo from '@arcgis/core/layers/support/AttachmentInfo';
import Attachments from '@arcgis/core/widgets/Attachments';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-anhang-edit',
  templateUrl: './anhang-edit.component.html',
  styleUrls: ['./anhang-edit.component.scss']
})
export class AnhangEditComponent implements OnInit {
  @ViewChild('attachemts', { static: true }) attachmentsContainer: ElementRef;
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `anhang_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getAttachmentInfos(): AttachmentInfo[] {
    return this.feature.attachmentInfos ?? [];
  }

  getHeaderText(): string {
    // TODO dynamisch
    let bildart = '-';
    if (this.feature.attributes.BILD_ART === 1) {
      bildart = 'Foto';
    } else if (this.feature.attributes.BILD_ART === 0) {
      bildart = 'Skizze';
    } else if (this.feature.attributes.BILD_ART === 2) {
      bildart = 'weitere';
    }

    const attachmentName = this.getAttachmentInfos().map(m => m.name).join(',');

    return `${bildart} - ${attachmentName}`;
  }

  handleFileInput(files: FileList): void {
    this.feature.attachmentUpload = files.item(0);
  }
}
