import { Inject, Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { config } from 'rxjs';
import { ConfigService } from '../configs/config.service';
import { GdbVersion } from '../models/GdbVersion.model';
import { MessageService } from './message.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(QueryService) private queryService: QueryService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  public async exportToFile(featureLayer: FeatureLayer, objectIds: number[], format: string): Promise<string> {
    try {

      const parameters = {
        featureclass: featureLayer.id,
        format,
        objectids: objectIds.join(','),
        gdbVersion: featureLayer.gdbVersion,
        system: this.configService.getSystem().toString()
      };

      const url = this.configService.getGpConfig().exportToFile;
      const result = await this.queryService.geoprocessJob(url, parameters);

      if (result.results[0].value === undefined) {
        throw Error(`invalid result: ${result}`);
      }

      return "downloadString";

    } catch (error) {
      this.messageService.error('Parcel-Info-Call failed', error);
    }
  }
}
