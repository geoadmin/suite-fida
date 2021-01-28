import { Inject, Injectable } from '@angular/core';
import Geometry from '@arcgis/core/geometry/Geometry';
import Point from '@arcgis/core/geometry/Point';
import { ConfigService } from '../configs/config.service';
import { ParcelInfo } from '../models/ParcelInfo.model';
import { MessageService } from './message.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class ParcelInfoService {

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(QueryService) private queryService: QueryService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  public async getParcelInfo(geometry: Geometry): Promise<ParcelInfo[]> {
    try {
      const point = (geometry as Point);
      if (!point) {
        throw new Error('invalid geometry');
      }

      const parameters = {
        East: point.x,
        North: point.y,
        Dist: 1
      };

      const url = this.configService.getGpConfig().getParcelInfoUrl;
      const result = await this.queryService.geoprocess(url, parameters);

      if (result.results[0].value === undefined) {
        throw Error(`invalid result: ${result}`);
      }

      const parcelInfos: ParcelInfo[] = result.results[0].value;
      return parcelInfos;

    } catch (error) {
      this.messageService.error('Parcel-Info-Call failed', error);
    }
  }
}
