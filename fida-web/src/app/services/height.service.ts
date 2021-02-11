import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Point } from '@arcgis/core/geometry';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeightService {

  constructor(
    @Inject(HttpClient) private httpClient: HttpClient,
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  async getHeight(point: Point): Promise<any> {
    const url = this.configService.getGpConfig().heightUrl;

    let params = new HttpParams();
    params = params.append('easting', point.x.toString());
    params = params.append('northing', point.y.toString());

    return await this.httpClient.get(url, { params })
      .toPromise()
      .then((result: any) => {
        const height: number = parseFloat(result.height);
        return height;
      })
      .catch((error: any) => {
        this.messageService.warning('No height found.');
      });

  }
}

