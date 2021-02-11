import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Point } from '@arcgis/core/geometry';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class Lk25Service {

  constructor(
    @Inject(HttpClient) private httpClient: HttpClient,
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  async getTileId(point: Point): Promise<number> {
    const url = this.configService.getGpConfig().lk25Url;
    const geometry = `${point.x.toString()},${point.y.toString()}`;

    let params = new HttpParams();
    params = params.append('geometryType', 'esriGeometryPoint');
    params = params.append('geometry', geometry);
    params = params.append('imageDisplay', '0,0,0');
    params = params.append('mapExtent', '0,0,0,0');
    params = params.append('tolerance', '0');
    params = params.append('sr', '2056');
    params = params.append('layers', 'all:ch.swisstopo.pixelkarte-pk25.metadata');
    params = params.append('returnGeometry', 'false');

    return await this.httpClient.get(url, { params })
      .toPromise()
      .then((response: any) => {
        if (response.results.length > 1) {
          this.messageService.warning('Multiple LK25 found');
          return;
        }
        if (response.results.length === 0) {
          this.messageService.warning('No LK25 found');
          return;
        }
        return response.results[0].attributes.tileid;
      })
      .catch((error: any) => {
        this.messageService.error('LK25 call failed.', error);
      });
  }
}
