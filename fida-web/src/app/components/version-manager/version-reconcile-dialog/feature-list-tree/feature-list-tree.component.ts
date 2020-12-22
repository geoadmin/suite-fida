import { Component, Input, OnInit } from '@angular/core';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-feature-list-tree',
  templateUrl: './feature-list-tree.component.html',
  styleUrls: ['./feature-list-tree.component.scss']
})
export class FeatureListTreeComponent implements OnInit {
  @Input() features: FidaFeature[];
  @Input() title: string;
  @Input() componentId: string;

  constructor(private featureService: FeatureService) { }

  ngOnInit(): void {
  }

  getFeatureName(feature: FidaFeature): string {
    return this.featureService.getFeatureName(feature);
  }

  getId(prefix: string, feature: any): string {
    return `${prefix}-${feature?.attributes.GLOBALID.replace('{', '').replace('}', '')}`;
  }
}
