import { Component, Input, OnInit } from '@angular/core';
import { FidaDifferenceFeature, FidaDifferenceGroup } from 'src/app/models/Difference.model';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-difference-tree',
  templateUrl: './difference-tree.component.html',
  styleUrls: ['./difference-tree.component.scss']
})
export class DifferenceTreeComponent implements OnInit {
  @Input() differenceFeature: FidaDifferenceFeature;
  @Input() defaultFeatures: FidaFeature[];
  @Input() showAll: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  getId(prefix: string, feature: FidaDifferenceFeature): string {
    return `${prefix}-${feature?.globalId.replace('{', '').replace('}', '')}`;
  }

  hideRelatedFeatures(relatedFeatureGroup: FidaDifferenceGroup): boolean {
    return relatedFeatureGroup.features?.length === 0;
  }

  getDiffClass(feature: FidaDifferenceFeature): string {
    return 'diff-' + feature.state?.toString();
  }
}
