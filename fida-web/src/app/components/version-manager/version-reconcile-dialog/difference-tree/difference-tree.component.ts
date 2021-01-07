import { Component, Input, OnInit } from '@angular/core';
import { FidaDifference } from 'src/app/models/Differences';
import { FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-difference-tree',
  templateUrl: './difference-tree.component.html',
  styleUrls: ['./difference-tree.component.scss']
})
export class DifferenceTreeComponent implements OnInit {
  @Input() difference: FidaDifference;
  @Input() showAll: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  getId(prefix: string, feature: any): string {
    return `${prefix}-${feature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
  }

  hideRelatedFeatures(relatedFeatures: FidaFeature[]): boolean {
    return !this.showAll && relatedFeatures.length === 0;
  }

  getDiffClass(feature: FidaFeature): string {
    return 'diff-' + feature.state?.toString();
  }

  getDefaultRelatedFeature(relatedFeature: FidaFeature, relationshipName: string): FidaFeature {
    const defaultRelatedFeatures = this.difference.defaultFeature?.relatedFeatures as any;
    if(defaultRelatedFeatures){
      const fidaFeatures = defaultRelatedFeatures[relationshipName] as FidaFeature[];
      return fidaFeatures.find(f => f.attributes.OBJECTID === relatedFeature.attributes.OBJECTID);
    }
  }
}
