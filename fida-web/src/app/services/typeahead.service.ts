import { Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { FidaFeature, LayerId } from '../models/FidaFeature.model';
import { FidaFeatureSearch } from '../models/FidaFeatureSearch.model';
import { QueryService } from './query.service';
import { UtilService } from 'src/app/services/util.service';
import { ConfigService } from '../configs/config.service';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  public searchLoading: boolean;
  public searchNoResults: boolean;
  public selectedSearchItem: FidaFeatureSearch;

  constructor(private queryService: QueryService) {
  }

  public async queryKontaktFeatures(featureLayer: FeatureLayer, searchText: string, fkField: string): Promise<FidaFeatureSearch[]> {

    const search = searchText.toLocaleLowerCase();
    let searchWhere = `LOWER(ART) like '%${search}%'`;
    searchWhere += `OR LOWER(FIRMA) like '%${search}%'`;
    searchWhere += `OR LOWER(VORNAME) like '%${search}%'`;
    searchWhere += `OR LOWER(NAME) like '%${search}%'`;
    searchWhere += `OR LOWER(ADRESSE) like '%${search}%'`;
    searchWhere += `OR LOWER(PLZ) like '%${search}%'`;
    searchWhere += `OR LOWER(ORT) like '%${search}%'`;
    searchWhere += `OR LOWER(EMAIL) like '%${search}%'`;
    searchWhere += `OR LOWER(TELEFON) like '%${search}%'`;

    const fkWhere = `${fkField} IS NULL`;
    const where = `(${fkWhere}) AND (${searchWhere})`;

    return this.queryService.where(featureLayer, where).then(features => {
      return features.map(feature => {
        return {
          feature,
          name: UtilService.kontaktToLine(feature)
        };
      });
    });
  }

  public onSearchLoading(e: boolean): void {
    this.searchLoading = e;
    if (this.searchLoading) {
      this.selectedSearchItem = undefined;
    }
  }

  public onSearchNoResults(e: boolean): void {
    this.searchNoResults = e;
  }

  public onSearchSelect(e: TypeaheadMatch): void {
    this.selectedSearchItem = e.item;
  }
}
