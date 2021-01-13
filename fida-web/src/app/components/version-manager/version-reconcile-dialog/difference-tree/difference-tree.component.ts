import { Component, Input, OnInit } from '@angular/core';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-difference-tree',
  templateUrl: './difference-tree.component.html',
  styleUrls: ['./difference-tree.component.scss']
})
export class DifferenceTreeComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() defaultFeatures: FidaFeature[];

  constructor() { }

  ngOnInit(): void {
  }

  getId(prefix: string, feature: any): string {
    return `${prefix}-${feature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
  }

  hideRelatedFeatures(relatedFeatures: FidaFeature[]): boolean {
    return relatedFeatures.length === 0;
  }

  getDiffClass(feature: FidaFeature): string {
    return 'diff-' + feature.state?.toString();
  }

  getDefaultFeature(relatedFeature: FidaFeature): FidaFeature {
    return this.defaultFeatures?.find(f => f.attributes.GLOBALID === relatedFeature.attributes.GLOBALID);
  }
}
