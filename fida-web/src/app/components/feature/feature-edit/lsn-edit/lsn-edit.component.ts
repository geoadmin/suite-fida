import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-lsn-edit',
  templateUrl: './lsn-edit.component.html',
  styleUrls: ['./lsn-edit.component.scss']
})
export class LsnEditComponent implements OnInit {
  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;

  constructor() { }

  ngOnInit(): void {
    for (const key of Object.keys(this.feature.attributes)) {
      this.formGroup.addControl(key, new FormControl());
    }
  }
}
