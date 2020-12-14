import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Expand from 'esri/widgets/Expand';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { SettingService } from 'src/app/services/setting.service';
import { VersionManagementService } from 'src/app/services/version-management.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { VersionCreateDialogComponent } from './version-create-dialog/version-create-dialog.component';
import { VersionDeleteDialogComponent } from './version-delete-dialog/version-delete-dialog.component';
import { UtilService } from 'src/app/services/util.service';
import { VersionReconcileDialogComponent } from './version-reconcile-dialog/version-reconcile-dialog.component';

@Component({
  selector: 'app-version-manager',
  templateUrl: './version-manager.component.html',
  styleUrls: ['./version-manager.component.scss']
})
export class VersionManagerComponent implements OnInit, OnDestroy {
  @ViewChild('versionManager', { static: true }) private versionManagerElement: ElementRef;
  @ViewChild(VersionReconcileDialogComponent) private versionReconcileDialog: VersionReconcileDialogComponent;

  versions: GdbVersion[] = [];
  isReconciling: boolean = false;
  private expand: Expand;
  private expandedHandle: any;

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
    return version.versionName === this.versionManagementService.getDefaultVersionName();
  }

  setActiveVersionClick(version: GdbVersion): void {
    this.settingService.setGdbVersionName(version.versionName);
  }

  getDate(value: any): string {
    if (value == null) {
      return '';
    }

    const date = new Date(value);
    return UtilService.formatDateTime(date);
  }

  getFormatedVersionName(versionName: string): string {
    return UtilService.formatVersionName(versionName);
  }

  private async initVersions(reload?: boolean): Promise<any> {
    if (this.versions.length === 0 || reload === true) {
      this.versions = await this.versionManagementService.getVersionInfos();
    }
  }

  closeClick(): void{
    this.expand.collapse();
  }

  /**
  * reconcile/Post
  */
  async showReconcilePostDialogClick(version: GdbVersion): Promise<void> {
      this.isReconciling = true;
      this.versionReconcileDialog.reconcile(version);          
  }

  reconcileFinished(success: boolean):void {
    this.isReconciling = false;
    if(success){
      this.initVersions(true);
    }
  }

  /**
   * create version
   */
  showCreateDialogClick(): void {
    const modalRef = this.modalService.show(VersionCreateDialogComponent);

    modalRef.content.onCreate.subscribe(async (gdbVersion: GdbVersion) => {
      const createdVersion = await this.versionManagementService.createVersion(gdbVersion.versionName, gdbVersion.description);
      this.versions.push(createdVersion);
      modalRef.hide();
    });

    modalRef.content.onCancel.subscribe(() => {
      modalRef.hide();
    });
  }

  /**
   * delete version
   */
  showDeleteDialogClick(version: GdbVersion): void {
    const modalRef = this.modalService.show(VersionDeleteDialogComponent, { class: 'modal-sm', initialState: { gdbVersion: version } });

    modalRef.content.onDelete.subscribe(async (gdbVersion: GdbVersion) => {
      const success = await this.versionManagementService.deleteVersion(gdbVersion.versionName);
      if (success) {
        // remove from list
        const index = this.versions.indexOf(version);
        this.versions.splice(index, 1);

        // when delet version is active -> set to default
        if(gdbVersion.versionName === this.settingService.getGdbVersionName()){
          this.settingService.setDefaultVersion();
        }
      } else {
        throw new Error('version could not be deleted');
      }
      modalRef.hide();
    });
  }
}
