import { Component, Input, OnInit } from '@angular/core';
import { FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-difference-attribute-tree',
  templateUrl: './difference-attribute-tree.component.html',
  styleUrls: ['./difference-attribute-tree.component.scss']
})
export class DifferenceAttributeTreeComponent implements OnInit {
  @Input() versionFeature: FidaFeature;
  @Input() defaultFeature: FidaFeature;
  @Input() showAll: boolean;
  @Input() relationshipName: RelationshipName;
  @Input() header: string;

  componentId: string;


  constructor() { }

  ngOnInit(): void {
    this.componentId = `fid-${this.versionFeature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
    if (!this.header && this.versionFeature != null) {
      this.header = `${UtilService.getFeatureHeader(this.versionFeature, this.relationshipName) || ''} [${this.versionFeature.attributes.OBJECTID}]`;
    }
  }

  getDefaultAttribute(key: string): any {
    return this.defaultFeature?.attributes[key];
  }
}
