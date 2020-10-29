import { Component, Input, OnInit } from '@angular/core';
import FeatureLayer from 'esri/layers/FeatureLayer';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';
import Field from 'esri/layers/support/Field';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-attribute-view',
  templateUrl: './attribute-view.component.html',
  styleUrls: ['./attribute-view.component.scss']
})
export class AttributeViewComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() name: string;
  private field: Field;
  
  constructor() { }

  ngOnInit(): void {    
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.name);
  }

  private getFeatureLayer(): FeatureLayer{
    return this.feature?.layer as FeatureLayer;
  }

  getFormatedValue(): string {
    const value = this.feature.attributes[this.name];
    if(value === undefined || value === null){
      return '';
    }

    if(this.field.domain !== null && this.field.domain.type === 'coded-value'){
      const codedValueDomain = this.field.domain as CodedValueDomain;
      const codedValue = codedValueDomain.codedValues.find(f => f.code === value);
      return codedValue.name;
    }

    if(this.field.type === 'date'){
      const date = new Date(this.feature.attributes[this.name]); 
      return date.toDateString();
    }

    return value;
  }

}
