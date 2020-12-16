import { Injectable } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import Point from 'esri/geometry/Point';
import { ConfigService } from '../configs/config.service';
import { ParcelInfo } from '../models/ParcelInfo.model';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class ParcelInfoService {

  constructor(
    private configService: ConfigService,
    private queryService: QueryService
  ) { }

  public async getParcelInfo(geometry: Geometry): Promise<ParcelInfo[]> {

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

    const parcelInfos: ParcelInfo[] = result.results[0].value;
    return parcelInfos;
  }

}
