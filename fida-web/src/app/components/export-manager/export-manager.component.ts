import { Component, OnInit } from '@angular/core';
import JobInfo from '@arcgis/core/tasks/support/JobInfo';
import { Subject } from 'rxjs';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { ExportService } from 'src/app/services/export.service';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-export-manager',
  templateUrl: './export-manager.component.html',
  styleUrls: ['./export-manager.component.scss']
})
export class ExportManagerComponent implements OnInit {
  public feature: FidaFeature;
  public format: string;
  public formats: string[];
  public jobInfo: JobInfo;
  public processing = false;
  public downloadUrl: string;
  public onCancel: Subject<any>;

  constructor(
    private exportService: ExportService,
    private featureService: FeatureService
  ) { }

  ngOnInit(): void {
    this.onCancel = new Subject();
    this.exportService.getFormatList().then(formats => this.formats = formats);
    this.format = 'PDF'; // default
  }

  async exportClick(): Promise<void> {
    const featureLayer = this.featureService.getFeatureLayer(this.feature);
    const objectIds = [this.feature.attributes.OBJECTID];
    this.processing = true;

    this.downloadUrl = await this.exportService.exportToFile(featureLayer, objectIds, this.format, (jobInfo: JobInfo) => {
      this.jobInfo = jobInfo;
      const status = jobInfo.jobStatus;
      if (status !== 'job-submitted' && status !== 'job-waiting' && status !== 'job-executing') {
        this.processing = false;
      }
    });

    this.processing = false;
  }

  async cancelJobClick(): Promise<void> {
    this.jobInfo = await this.exportService.cancelExportJob(this.jobInfo.jobId);
    this.processing = false;
  }

  cancelClick(): void {
    this.onCancel.next();
  }

}
