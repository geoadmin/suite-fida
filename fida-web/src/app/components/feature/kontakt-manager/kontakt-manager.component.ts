import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { FeatureState, FidaFeature, LayerId, RelationshipName } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';
import { KontaktEditDialogComponent } from './kontakt-edit-dialog/kontakt-edit-dialog.component';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TypeaheadService } from 'src/app/services/typeahead.service';
import { FidaFeatureSearch } from 'src/app/models/FidaFeatureSearch.model';
import { ConfigService } from 'src/app/configs/config.service';

@Component({
  selector: 'app-kontakt-manager',
  templateUrl: './kontakt-manager.component.html',
  styleUrls: ['./kontakt-manager.component.scss']
})
export class KontaktManagerComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;

  public searchList: Observable<FidaFeatureSearch[]>;
  public searchText: string;

  constructor(
    private featureService: FeatureService,
    public typeaheadService: TypeaheadService,
    private configService: ConfigService,
    private modalService: BsModalService
  ) { }

  async ngOnInit(): Promise<void> {
    const featureLayer = this.featureService.getFeatureLayer(this.feature);
    const fkField = this.configService.getLayerConfigById(featureLayer.id).fkField;

    const kontanktFeatureLayer = await this.featureService.getRelatedFeatureLayerByName(featureLayer, RelationshipName.kontakt);

    // define search list
    this.searchList = new Observable((observer: any) => {
      observer.next(this.searchText);
    }).pipe(mergeMap((searchText: string) => {
      return this.typeaheadService.queryKontaktFeatures(kontanktFeatureLayer, searchText, fkField);
    }));
  }

  async addKontaktClick(): Promise<any> {
    const kontaktFeature = this.typeaheadService.selectedSearchItem.feature;
    kontaktFeature.state = FeatureState.Edit;
    this.featureService.addRelatedFeatureToList(this.feature, RelationshipName.kontakt, kontaktFeature);
  }

  async createKontaktClick(): Promise<any> {
    const kontaktFeautre = await this.featureService.createRelatedFeature(this.feature, RelationshipName.kontakt, false);
    const modalRef = this.modalService.show(KontaktEditDialogComponent,
      { class: 'modal-dialog-centered', initialState: { feature: kontaktFeautre } });

    modalRef.content.onSave.subscribe(async (createdFeature: FidaFeature) => {
      this.featureService.addRelatedFeatureToList(this.feature, RelationshipName.kontakt, createdFeature);
      modalRef.hide();
    });

    modalRef.content.onCancel.subscribe(() => {
      modalRef.hide();
    });
  }

  getKontaktFeatures(): FidaFeature[] {
    return this.feature?.relatedFeatures?.kontakt?.filter((f: FidaFeature) => f.state !== FeatureState.Delete);
  }
}
