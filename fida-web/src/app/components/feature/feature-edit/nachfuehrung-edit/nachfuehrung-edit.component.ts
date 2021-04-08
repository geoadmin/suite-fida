import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TypeaheadService } from 'src/app/services/typeahead.service';
import { mergeMap } from 'rxjs/operators';
import { FeatureService } from 'src/app/services/feature.service';
import { FeatureState, FidaFeature, RelationshipName } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';
import { WorkAbbreviationService } from 'src/app/services/work-abbreviation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nachfuehrung-edit',
  templateUrl: './nachfuehrung-edit.component.html',
  styleUrls: ['./nachfuehrung-edit.component.scss']
})
export class NachfuehrungEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  @Input() language: string;
  public componentId: string;
  public workAbbreviationList: string[];

  constructor(
    private workAbbreviationService: WorkAbbreviationService,
    private featureService: FeatureService
  ) { }

  async ngOnInit(): Promise<void> {
    this.componentId = `nachfuehrung_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
    this.formGroup.addControl(this.componentId, new FormGroup({}));

    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }

    this.workAbbreviationList = await this.workAbbreviationService.getWorkAbbreviationList(this.language);

    // define "arbeitskuerzeltext" typeahead
    /*const featureLayer = this.featureService.getFeatureLayer(this.feature);
    const nachfuehrungFeatureLayer = await this.featureService.getRelatedFeatureLayerByName(featureLayer, RelationshipName.nachfuehrung);

    this.searchList = new Observable((observer: any) => {
      observer.next(this.searchText);
    }).pipe(mergeMap((searchText: string) => {
      return this.typeaheadService.queryArbeitskuerzeltext(nachfuehrungFeatureLayer, searchText);
    }));
    */
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getHeaderText(): string {
    return UtilService.getFeatureHeader(this.feature, RelationshipName.nachfuehrung);
  }
}
