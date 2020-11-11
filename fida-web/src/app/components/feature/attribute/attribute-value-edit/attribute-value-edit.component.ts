import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import FeatureLayer from 'esri/layers/FeatureLayer';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';
import Field from 'esri/layers/support/Field';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-attribute-value-edit',
  templateUrl: './attribute-value-edit.component.html',
  styleUrls: ['./attribute-value-edit.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AttributeValueEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() name: string;
  @Input() placeholder: string;
  @Input() type: string;
  
  private field: Field;
  
  constructor() { }

  ngOnInit(): void {    
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.name);

    if(this.field === undefined){
      throw new Error(`Field ${name} not found in layer ${this.feature.layer.id}`);
    }

    // convert value to date-object
    if(this.field.type === 'date'){
      const value = this.feature.attributes[this.name];
      if(value && value !== null){
        this.feature.attributes[this.name] = new Date(value);
      }      
    }    
  }

  ngAfterViewInit(): void{
  }

  ngOnDestroy(): void {    
  }

  private getFeatureLayer(): FeatureLayer{
    return this.feature?.layer as FeatureLayer;
  }

  getFieldType(): string {
    if(this.type){
      return this.type;
    }    
    
    if(!this.field){
      return;
    }
    
    if(this.field.domain !== null && this.field.domain.type === 'coded-value'){
      return 'domain';
    }

    if(this.field.type ===  'small-integer' 
    || this.field.type ===  'integer' 
    || this.field.type ===  'single'
    || this.field.type ===  'double'){
      return 'number'
    }

    return this.field.type;
  }

  getCodedValues(): object[] {
    const codedValueDomain = this.field.domain as CodedValueDomain;
    return codedValueDomain.codedValues ?? [];
  }
}
