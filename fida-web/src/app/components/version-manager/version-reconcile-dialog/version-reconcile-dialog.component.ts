import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GdbVersion } from 'src/app/models/GdbVersion.model';
import { MessageService } from 'src/app/services/message.service';
import { VersionManagementService } from 'src/app/services/version-management.service';

@Component({
  selector: 'app-version-reconcile-dialog',
  templateUrl: './version-reconcile-dialog.component.html',
  styleUrls: ['./version-reconcile-dialog.component.scss']
})
export class VersionReconcileDialogComponent implements OnInit {
  @Output() reconcileFinished: EventEmitter<boolean> = new EventEmitter();
  version: GdbVersion;
  differences: any;

  constructor(
    private versionManagementService: VersionManagementService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
  }

  /**
  * reconcile/Post
  */
  async reconcile(version: GdbVersion): Promise<void> {
    try {
      this.version = version;
      const purgeLockResult = await this.versionManagementService.purgeLock(version);
      this.checkResult(purgeLockResult);

      // start reading
      const startReadingResult = await this.versionManagementService.startReading(version);
      this.checkResult(startReadingResult);

      // show difference
      const differencesResult = await this.versionManagementService.differences(version);
      this.checkResult(differencesResult);
      this.differences = JSON.stringify(differencesResult);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
  }

  
  private checkResult(result: any): void {
    if (result.success === false) {
      throw result.error;
    }
  }

  async cancelReconsilingClick(): Promise<void> {
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
  }

  async declineDifferencesClick(): Promise<void> {
    try {
      // stop reading
      const stopReadingResult = await this.versionManagementService.stopReading(this.version);
      this.checkResult(stopReadingResult);
      this.reconcileFinished.next(false);

    } catch (error) {
      this.messageService.error('Reconsile/Post failed', error);
    }
  }

  async acceptDifferencesClick(): Promise<void> {
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
  }
}
