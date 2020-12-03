import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.scss']
})
export class DefaultViewComponent implements OnInit {
 @Input() feature: FidaFeature;
 public form: FormGroup;

 //private attachemts: Attachments;

 constructor() { }

 ngOnInit(): void {
   this.form = new FormGroup({});
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