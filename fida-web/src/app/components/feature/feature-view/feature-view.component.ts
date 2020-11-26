import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import Feature from 'esri/Graphic';
import Attachments from 'esri/widgets/Attachments';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-feature-view',
  templateUrl: './feature-view.component.html',
  styleUrls: ['./feature-view.component.scss']
})
export class FeatureViewComponent implements OnInit {
  //@ViewChild('attachemts', { static: true }) attachmentsContainer: ElementRef;
  @Input() feature: FidaFeature;
  public form: FormGroup;

  //private attachemts: Attachments;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({});

    // const attachments = new Attachments({
    //   container: this.attachmentsContainer.nativeElement,
    //   graphic: this.feature
    // });
    // attachments.viewModel.mode = 'view';
  }

  addAttachment(): void {

  }

  editAttachment(): void {
  
  }

  getAttributes(attributes: any): any{
    return attributes;
    return Object.entries(attributes).filter(([key, value]) => 
    key !== 'OBJECTID' 
    && key !== 'GLOBALID' 
    && key !== 'CREATOR_FIELD' 
    && key !== 'CREATOR_DATE_FIELD' 
    && key !== 'LAST_EDITOR_FIELD' 
    && key !== 'LAST_EDITOR_DATE_FIELD'
    && key !== 'FK_FIDA_LFP' 
    && key !== 'FK_FIDA_HFP' 
    && key !== 'PUNKTID_FPDS' 
    && key !== 'MUTATIONID_FPDS' 
    )
  }
}
