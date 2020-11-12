import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-nachfuehrung-edit',
  templateUrl: './nachfuehrung-edit.component.html',
  styleUrls: ['./nachfuehrung-edit.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class NachfuehrungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  
  constructor() { }

  ngOnInit(): void {
  }

  getId(): string {
    return `nachfuehrung_${this.feature.attributes.OBJECTID}`;
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
