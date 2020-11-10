import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-feature-edit',
  templateUrl: './feature-edit.component.html',
  styleUrls: ['./feature-edit.component.scss']
})
export class FeatureEditComponent implements OnInit {
  @Input() feature: FidaFeature;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
  }

  async addRelatedFeatureClick(relatedFeaturesPropertyName: string): Promise<void> {
    await this.featureService.createRelatedFeature(this.feature, relatedFeaturesPropertyName);
    this.changeDetectorRef.detectChanges();
  }

  deleteRelatedFeatureClick(feature: FidaFeature): void {
    feature.state = FeatureState.Delete;
    this.changeDetectorRef.detectChanges();
  }

  getRelatedFeatures(relatedFeatures: FidaFeature[]) {
    return relatedFeatures?.filter(f => f.state !== FeatureState.Delete);
  }
}
