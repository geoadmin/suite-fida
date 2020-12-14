import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-kontakt-edit-dialog',
  templateUrl: './kontakt-edit-dialog.component.html',
  styleUrls: ['./kontakt-edit-dialog.component.scss']
})
export class KontaktEditDialogComponent implements OnInit {
  @Input() feature: FidaFeature;
  public form: FormGroup;
  public onSave: Subject<FidaFeature>;
  public onCancel: Subject<void>;
  
  constructor() { }

  ngOnInit(): void {
    this.onSave = new Subject();
    this.onCancel = new Subject();

    this.form = new FormGroup({});
    for (let key in this.feature.attributes) {
      this.form.addControl(key, new FormControl());
    }
  }

  saveClick(): void {
    this.onSave.next(this.feature);
  }

  cancelClick(): void {
    this.onCancel.next();
  }
}
