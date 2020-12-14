import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { GdbVersion } from 'src/app/models/GdbVersion.model';

@Component({
  selector: 'app-version-create-dialog',
  templateUrl: './version-create-dialog.component.html',
  styleUrls: ['./version-create-dialog.component.scss']
})
export class VersionCreateDialogComponent implements OnInit {
  public form: FormGroup;
  public gdbVersion: GdbVersion;
  public onCreate: Subject<GdbVersion>;
  public onCancel: Subject<void>;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      versionName: new FormControl('', Validators.required),
      description: new FormControl(),
    });
    this.onCreate = new Subject();
    this.onCancel = new Subject();
    this.gdbVersion = new GdbVersion();
  }

  createClick(): void {
    this.onCreate.next(this.gdbVersion);
  }

  cancelClick(): void {
    this.onCancel.next();
  }
}
