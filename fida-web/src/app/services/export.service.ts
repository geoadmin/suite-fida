import { Inject, Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import JobInfo from '@arcgis/core/tasks/support/JobInfo';
import ParameterValue from '@arcgis/core/tasks/support/ParameterValue';
import { ConfigService } from '../configs/config.service';
import { ExportToFileOptions } from '../models/ExportToFile.model';
import { MessageService } from './message.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private formats: string[];

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(QueryService) private queryService: QueryService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  public async exportToFile(
    featureLayer: FeatureLayer,
    objectIds: number[],
    format: string,
    statusCallback: (jobInfo: JobInfo) => void
  ): Promise<string> {
    try {

      const parameters: ExportToFileOptions = {
        featureclass: featureLayer.id,
        format,
        objectids: objectIds.join(','),
        gdbVersion: featureLayer.gdbVersion,
        system: this.configService.getSystem().toString()
      };

      const url = this.configService.getGpConfig().exportToFile;
      const jobInfo = await this.queryService.geoprocessSubmitJob(url, parameters, statusCallback);
      statusCallback(jobInfo);

      const result: ParameterValue = await this.queryService.geoprocessGetResult(url, jobInfo.jobId, 'getoutput');
      return result.value;

    } catch (error) {
      this.messageService.error('ExportToFile-Call failed', error);
    }
  }

  public async cancelExportJob(jobId: string): Promise<JobInfo> {
    try {
      const url = this.configService.getGpConfig().exportToFile;
      return await this.queryService.geoprocessCancel(url, jobId);
    } catch (error) {
      this.messageService.error('ExportToFile-Cancel failed', error);
    }
  }

  public async getFormatList(): Promise<string[]> {
    if (this.formats) {
      Promise.resolve(this.formats);
    }

    const url = this.configService.getGpConfig().exportToFile;
    const result = await this.queryService.request(url);

    const formatParameter = result.data.parameters.find((f: any) => f.name === 'format');
    if (formatParameter === undefined) {
      throw Error(`Could not load export-formats`);
    }
    this.formats = formatParameter.choiceList;
    return this.formats;
  }

}
