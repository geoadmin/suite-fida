import { Component, Input, OnInit } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import Field from '@arcgis/core/layers/support/Field';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-attribute-value-view',
  templateUrl: './attribute-value-view.component.html',
  styleUrls: ['./attribute-value-view.component.scss']
})
export class AttributeValueViewComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() name: string;
  @Input() type: string;
  field: Field;

  constructor() { }

  ngOnInit(): void {
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.name);
  }

  private getFeatureLayer(): FeatureLayer {
    return this.feature?.layer as FeatureLayer;
  }

  getFormatedValue(): string {
    const value = this.feature.attributes[this.name];
    if (value == null) {
      return ' ';
    }
    if (this.field === undefined) {
      return value;
    }
    if (this.field.domain != null && this.field.domain.type === 'coded-value') {
      const codedValueDomain = this.field.domain as CodedValueDomain;
      const codedValue = codedValueDomain.codedValues.find(f => f.code === parseInt(value, 10));
      if (codedValue === undefined) {
        console.error(`No coded-value in domain ${this.field.domain.name} for value ${value} found.`);
        return value;
      }
      return codedValue.name;
    }

    if (this.field.type === 'date') {
      const date = new Date(this.feature.attributes[this.name]);
      return date.toDateString();
    }

    return value;
  }

  isNumber(): boolean {
    return this.field.domain == null && UtilService.isNumberField(this.field);
  }

  isMultiselect(): boolean {
    console.log(this.name, this.type, this.type === 'multiselect');
    return this.type === 'multiselect';
  }

}
