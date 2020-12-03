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
  @Input() readonly: boolean = false;

  constructor() { }

  ngOnInit(): void {
    for (let key in this.feature.attributes) {
      this.formGroup.addControl(key, new FormControl());
    }
  }
}
