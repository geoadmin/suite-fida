import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FeatureState, FidaFeature } from 'src/app/models/FidaFeature.model';
import { KontaktEditDialogComponent } from '../../kontakt-manager/kontakt-edit-dialog/kontakt-edit-dialog.component';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-kontakt-view',
  templateUrl: './kontakt-view.component.html',
  styleUrls: ['./kontakt-view.component.scss']
})
export class KontaktViewComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() readonly = false;

  public componentId: string;

  constructor(
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.componentId = `kontakt_v_${this.feature.attributes.OBJECTID || new Date().getTime()}`;
  }

  async editClick(): Promise<void> {
    const orgAttributes = { ...this.feature.attributes };
    const modalRef = this.modalService.show(KontaktEditDialogComponent,
      { class: 'modal-dialog-centered', initialState: { feature: this.feature } });

    modalRef.content.onSave.subscribe(async () => {
      this.feature.state = FeatureState.Edit;
      modalRef.hide();
    });

    modalRef.content.onCancel.subscribe(() => {
      this.feature.attributes = { ...orgAttributes };
      modalRef.hide();
    });
  }

  deleteClick(): void {
    this.feature.state = FeatureState.Delete;
  }

  getNameLine(): string {
    return UtilService.getVornameNameToLine(this.feature);
  }

  getLocationLine(): string {
    return UtilService.getPlzOrtToLine(this.feature);
  }

  getHeaderText(): string {
    const list: string[] = [];
    UtilService.addToList(list, this.feature.attributes.FIRMA);
    UtilService.addToList(list, UtilService.getVornameNameToLine(this.feature));
    UtilService.addToList(list, this.feature.attributes.ORT);

    return list.join(', ');
  }
}
