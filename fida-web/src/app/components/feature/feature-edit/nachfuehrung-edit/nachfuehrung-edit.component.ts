import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-nachfuehrung-edit',
  templateUrl: './nachfuehrung-edit.component.html',
  styleUrls: ['./nachfuehrung-edit.component.scss']
})
export class NachfuehrungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {   
    // create unique id 
    let id = this.feature.attributes.OBJECTID || new Date().getTime();
    this.componentId =  `nachfuehrung_${id}`;

    // create form controls 
    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
   }  
  }

  deleteClick():void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText():string {
    // TODO
    //let text = this.feature.attributes.NACHFUEHRUNGSDATUM ?? '';
    //text += this.feature.attributes.ARBEITSKUERZELTEXT ?? '';
    //if(text === ''){
      return this.feature.attributes.OBJECTID + ' (OBJECTID)';
    //}
  }
}
