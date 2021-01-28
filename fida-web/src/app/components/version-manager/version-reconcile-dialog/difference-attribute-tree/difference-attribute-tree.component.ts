import { Component, Input, OnInit } from '@angular/core';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import Field from '@arcgis/core/layers/support/Field';
import { ConfigService } from 'src/app/configs/config.service';
import { FidaDifferenceAttribute, FidaDifferenceFeature } from 'src/app/models/Difference.model';
import { RelationshipName } from 'src/app/models/FidaFeature.model';
import { FidaTranslateService } from 'src/app/services/translate.service';

@Component({
  selector: 'app-difference-attribute-tree',
  templateUrl: './difference-attribute-tree.component.html',
  styleUrls: ['./difference-attribute-tree.component.scss']
})
export class DifferenceAttributeTreeComponent implements OnInit {
  @Input() differenceFeature: FidaDifferenceFeature;
  @Input() showAll: boolean;
  @Input() relationshipName: RelationshipName;
  @Input() header: string;

  componentId: string;
  cutomHeader = true;
  private layerInfo: any;


  constructor(
    private translateService: FidaTranslateService,
    private configService: ConfigService,
  ) { }

  ngOnInit(): void {
    this.componentId = `fid-${this.differenceFeature?.globalId.replace('{', '').replace('}', '')}`;

    if (!this.header && this.differenceFeature != null) {
      this.header = `${this.differenceFeature.layerName} [${this.differenceFeature.objectId}]`;
      this.cutomHeader = false;
    }

    this.layerInfo = this.configService.getLayerInfoByName(this.differenceFeature.layerName);
  }

  getHeaderClass(): string {
    return this.cutomHeader ? 'diff-custom' : 'diff-' + this.differenceFeature?.state?.toString();
  }

  getDiffClass(attribute: FidaDifferenceAttribute): string {
    return 'diff-' + attribute?.state?.toString();
  }

  hideAttribute(attribute: FidaDifferenceAttribute): boolean {
    return (attribute.state === undefined) && !this.showAll;
  }

  getAttributeName(attribute: FidaDifferenceAttribute): string {
    return this.translateService.translateAttributeName(this.differenceFeature.layerName, attribute.name);
  }

  getColClass(attribute: FidaDifferenceAttribute): string {
    return attribute.defaultValue ? 'col-6' : 'col-12';
  }

  getFormatedVersionValue(attribute: FidaDifferenceAttribute): string {
    return this.getFormatedValue(attribute.versionValue, attribute.name);
  }

  getFormatedDefaultValue(attribute: FidaDifferenceAttribute): string {
    return this.getFormatedValue(attribute.defaultValue, attribute.name);
  }

  getFormatedValue(value: any, fieldName: string): string {
    if (this.layerInfo) {
      const field = Field.fromJSON(this.layerInfo.fields.find((f: any) => f.name === fieldName));

      if (field.domain != null && field.domain.type === 'coded-value') {
        const codedValueDomain = this.translateService.translateCodedValueDomain(field.domain as CodedValueDomain);
        const codedValue = codedValueDomain.codedValues.find(f => f.code === parseInt(value, 10));
        if (codedValue !== undefined) {
          return codedValue.name;
        }
      }

      if (field.type === 'date') {
        const date = new Date(value);
        return date.toDateString();
      }
    }

    return value;
  }
}
