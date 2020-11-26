import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-kontakt-edit',
  templateUrl: './kontakt-edit.component.html',
  styleUrls: ['./kontakt-edit.component.scss']
})
export class KontaktEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean = false;
  public componentId: string;

  constructor() { }

  ngOnInit(): void {
    this.componentId = `kontakt_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    const nameList: string[] = [];
    this.addToList(nameList, this.feature.attributes.VORNAME);
    this.addToList(nameList, this.feature.attributes.NAME);
    const name = nameList.join(' ');

    const list: string[] = [];
    this.addToList(list, this.feature.attributes.FIRMA);
    this.addToList(list, name);    
    this.addToList(list, this.feature.attributes.ORT);

    return list.join(', ');
  }

  private addToList(list: string[], value: any){
    if(value != null && value.trim() != ''){
      list.push(value);
    }
  }
}
