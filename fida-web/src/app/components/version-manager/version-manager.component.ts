import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Expand from 'esri/widgets/Expand';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { SettingService } from 'src/app/services/setting.service';
import { VersionManagementService } from 'src/app/services/version-management.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { VersionCreateDialogComponent } from './version-create-dialog/version-create-dialog.component';
import { VersionDeleteDialogComponent } from './version-delete-dialog/version-delete-dialog.component';

@Component({
  selector: 'app-version-manager',
  templateUrl: './version-manager.component.html',
  styleUrls: ['./version-manager.component.scss']
})
export class VersionManagerComponent implements OnInit, OnDestroy {
  @ViewChild('versionManager', { static: true }) private versionManagerElement: ElementRef;
  versions: GdbVersion[] = [];
  createVersion: any;
  private expand: Expand;
  private expandedHandle: any;
  private modalRef: BsModalRef;

  constructor(
    private widgetsService: WidgetsService,
    private versionManagementService: VersionManagementService,
    private settingService: SettingService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.expand = this.widgetsService.registerVersionManagerWidgetContent(this.versionManagerElement);

    this.expandedHandle = this.expand.watch("expanded", (newValue) => {
      if (newValue) {
        this.initVersions();
      }
    });
  }

  ngOnDestroy(): void {
    this.expandedHandle.remove();
  }

  isActiveVersion(version: GdbVersion): boolean {
    return version.versionName === this.settingService.getGdbVersionName();
  }

  isReadonlyVersion(version: GdbVersion): boolean {
    return version.versionName === 'SDE.DEFAULT' || version.versionId === 0;
  }

  setActiveVersionClick(version: GdbVersion): void {
    this.settingService.setGdbVersionName(version.versionName);
  }

  getDate(value: any): string {
    const date = new Date(value);
    return `${date.getDay()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
  }

  private async initVersions() {
    if (this.versions.length === 0) {
      this.versions = await this.versionManagementService.getVersionInfos();
    }
  }

  /*------------------------------
    create version  
   -------------------------------*/

  showCreateDialogClick(): void {
    this.modalRef = this.modalService.show(VersionCreateDialogComponent);
    this.modalRef.content.onCreate.subscribe(async (gdbVersion: GdbVersion) => {
      const createdVersion = await this.versionManagementService.createVersion(gdbVersion.versionName, gdbVersion.description);
      this.versions.push(createdVersion);
      this.modalRef.hide();
    })
  }

  /*------------------------------
    delete version  
   -------------------------------*/

  showDeleteDialogClick(version: GdbVersion): void {
    this.modalRef = this.modalService.show(VersionDeleteDialogComponent, { class: 'modal-sm', initialState: { gdbVersion: version } });
    this.modalRef.content.onDelete.subscribe(async (gdbVersion: GdbVersion) => {
      const success = await this.versionManagementService.deleteVersion(gdbVersion.versionName);
      if (success) {
        // remove from list
        const index = this.versions.indexOf(version);
        this.versions.splice(index, 1);
      } else {
        throw new Error('version could not be deleted');
      }
      this.modalRef.hide();
    })
  }
}
