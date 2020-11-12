import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-lfp-edit',
  templateUrl: './lfp-edit.component.html',
  styleUrls: ['./lfp-edit.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class LfpEditComponent implements OnInit {
  @Input() feature: FidaFeature;

  constructor(
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
  }

  async addNachfuehrungClick() {
    await this.featureService.createRelatedFeature(this.feature, 'nachfuehrung');
  }

  getNachfuehrungFeatures() {
    return this.feature?.relatedFeatures?.nachfuehrung?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }
}
