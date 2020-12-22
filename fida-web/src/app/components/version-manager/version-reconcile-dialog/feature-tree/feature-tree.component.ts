import { Component, Input, OnInit } from '@angular/core';
import { FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-feature-tree',
  templateUrl: './feature-tree.component.html',
  styleUrls: ['./feature-tree.component.scss']
})
export class FeatureTreeComponent implements OnInit {
  @Input() feature: FidaFeature;

  constructor() { }

  ngOnInit(): void {
  }

  getId(prefix: string, feature: any): string {
    return `${prefix}-${feature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
  }

  getRelatedFeatureHeader(feature: FidaFeature, relationshipName: RelationshipName): string {
    return UtilService.getFeatureHeader(feature, relationshipName);
  }
}
