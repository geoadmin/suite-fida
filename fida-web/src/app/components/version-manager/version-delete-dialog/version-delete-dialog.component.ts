import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-version-delete-dialog',
  templateUrl: './version-delete-dialog.component.html',
  styleUrls: ['./version-delete-dialog.component.scss']
})
export class VersionDeleteDialogComponent implements OnInit {
  public gdbVersion: GdbVersion;
  public onDelete: Subject<GdbVersion>;

  constructor(public modalRef: BsModalRef) { }

  ngOnInit(): void {
    this.onDelete = new Subject();
  }

  deleteClick(): void {
    this.onDelete.next(this.gdbVersion);
  }

  cancelClick(): void {
    this.modalRef.hide();
  }

  getFormatedVersionName(): string {
    return UtilService.formatVersionName(this.gdbVersion.versionName);
  }
}
