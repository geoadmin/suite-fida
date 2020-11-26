import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import AttachmentInfo from 'esri/layers/support/AttachmentInfo';
import Attachments from 'esri/widgets/Attachments';
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
  @Input() readonly: boolean = false;
  public componentId: string;
  public attachmentInfo: AttachmentInfo;
  
  constructor() { }

  ngOnInit(): void {
    this.componentId = `anhang_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }

    this. attachmentInfo = this.feature.attachemtInfos[0];
    // const attachments = new Attachments({
    //   container: this.attachmentsContainer.nativeElement,
    //   graphic: this.feature
    // });
    // attachments.viewModel.mode = this.readonly ? 'view': 'add';
    // attachments.displayType = 'list';
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    //TODO dynamisch
    let bildart = 'weitere';
    if(this.feature.attributes.BILD_ART === 1){
      bildart = 'Foto';
    } else if(this.feature.attributes.BILD_ART === 0){
      bildart = 'Skizze';
    }

    const attachmentName = this.feature.attachemtInfos[0].name;

    return `${bildart} - ${attachmentName}`;
  }
}
