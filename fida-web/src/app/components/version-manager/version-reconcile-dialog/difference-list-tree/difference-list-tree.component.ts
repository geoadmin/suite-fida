import { Component, Input, OnInit } from '@angular/core';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-difference-list-tree',
  templateUrl: './difference-list-tree.component.html',
  styleUrls: ['./difference-list-tree.component.scss']
})
export class DifferenceListTreeComponent implements OnInit {
  @Input() features: FidaFeature[];
  @Input() defaultFeatures: FidaFeature[];
  @Input() title: string;
  @Input() componentId: string;
  @Input() showAll: boolean;

  constructor(private featureService: FeatureService) { }

  ngOnInit(): void {
  }

  getFeatureName(feature: FidaFeature): string {
    return this.featureService.getFeatureName(feature);
  }

  getId(prefix: string, feature: any): string {
    return `${prefix}-${feature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
  }

  getDiffClass(feature: FidaFeature): string {
    return 'diff-' + feature.state?.toString();
  }

}
