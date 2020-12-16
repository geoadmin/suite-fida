import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { } from '@angular/forms';
import FeatureLayer from 'esri/layers/FeatureLayer';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';
import Field from 'esri/layers/support/Field';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-attribute-edit',
  templateUrl: './attribute-edit.component.html',
  styleUrls: ['./attribute-edit.component.scss']
})
export class AttributeEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() feature: FidaFeature;
  @Input() name: string;
  @Input() displayName: string;
  private field: Field;

  constructor() { }

  ngOnInit(): void {
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.name);

    // convert value to date-object
    if (this.field.type === 'date') {
      const value = this.feature.attributes[this.name];
      if (value != null) {
        this.feature.attributes[this.name] = new Date(value);
      }
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  private getFeatureLayer(): FeatureLayer {
    return this.feature?.layer as FeatureLayer;
  }

  getFieldType(): string {
    if (this.field.domain != null && this.field.domain.type === 'coded-value') {
      return 'domain';
    }

    if (this.field.type === 'small-integer'
      || this.field.type === 'integer'
      || this.field.type === 'single'
      || this.field.type === 'double') {
      return 'number';
    }

    return this.field.type;
  }

  getCodedValues(): object[] {
    const codedValueDomain = this.field.domain as CodedValueDomain;
    return codedValueDomain.codedValues ?? [];
  }
}
