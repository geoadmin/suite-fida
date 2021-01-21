import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FidaDifferences } from 'src/app/models/Difference.model';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { DifferenceService } from 'src/app/services/difference.service';
import { MessageService } from 'src/app/services/message.service';
import { VersionManagementService } from 'src/app/services/version-management.service';

@Component({
  selector: 'app-version-reconcile-dialog',
  templateUrl: './version-reconcile-dialog.component.html',
  styleUrls: ['./version-reconcile-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VersionReconcileDialogComponent implements OnInit {
  @Output() reconcileFinished: EventEmitter<boolean> = new EventEmitter();
  showSpinner: boolean;
  version: GdbVersion;
  differences: FidaDifferences;
  showAll: boolean;
  collapseAll: boolean;
  downloadUrl: SafeUrl;
  downloadName: string;
  downloaded = false;
  private modalRef: BsModalRef;

  constructor(
    private versionManagementService: VersionManagementService,
    private messageService: MessageService,
    private differenceService: DifferenceService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

  collapsAllClick(): void {
    this.collapseAll = true;
  }

  async cancelClick(): Promise<void> {
    this.showSpinner = true;
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  /**
   * reconcile
   */

  async reconcile(version: GdbVersion): Promise<void> {
    this.showSpinner = true;
    try {
      this.version = version;
      this.differences = undefined;

      const purgeLockResult = await this.versionManagementService.purgeLock(version);
      this.checkResult(purgeLockResult);

      // start reading
      const startReadingResult = await this.versionManagementService.startReading(version);
      this.checkResult(startReadingResult);

      // show difference
      const differencesResult = await this.versionManagementService.differences(version);
      this.checkResult(differencesResult);
      this.differences = await this.differenceService.convertDifferences(differencesResult.features, version);
      this.prepareDownload();

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  private prepareDownload(): void {
    const differencesJSON = JSON.stringify(this.differences, null, 2);
    this.downloadUrl = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(differencesJSON));
    this.downloadName = `differences_[${this.differences.version.versionName}]_[${this.differences.date.toLocaleString()}].json`;
  }

  private checkResult(result: any): void {
    if (result.success === false) {
      throw result.error;
    }
  }

  /**
   * decline differences
   */

  async declineDifferencesClick(): Promise<void> {
    this.showSpinner = true;
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  /**
   * accept differences
   */

  async acceptDifferencesClick(): Promise<void> {
    this.modalRef.hide();
    this.showSpinner = true;
    try {
      // start editing
      const startEditingResult = await this.versionManagementService.startEditing(this.version);
      this.checkResult(startEditingResult);

      // reconcile post
      const reconcileResult = await this.versionManagementService.reconcile(this.version);
      this.checkResult(reconcileResult);

      // stop editing
      const stopEditingResult = await this.versionManagementService.stopEditing(this.version);
      this.checkResult(stopEditingResult);

      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);

      this.messageService.success('Reconsile/Post was successfull');
      this.reconcileFinished.next(true);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
    this.showSpinner = false;
  }

  showAcceptDifferencesDialogClick(acceptDifferencesDialogTemplate: TemplateRef<any>): void {
    this.downloaded = false;
    this.modalRef = this.modalService.show(acceptDifferencesDialogTemplate, { class: 'modal-dialog-centered' });
  }

  acceptDifferencesCancelClick(): void {
    this.modalRef.hide();
  }

  downloadClick(): void {
    this.downloaded = true;
  }
}
