import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Point } from 'esri/geometry';
import { ConfigService } from '../configs/config.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeightService {

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
    private messageService: MessageService
    ) { }

  async getHeight(point: Point): Promise<any>{        
    const url = this.configService.getGpConfig().getHeightUrl;
  
    let params = new HttpParams();
    params = params.append('easting', point.x.toString());
    params = params.append('northing', point.y.toString());

    return await this.httpClient.get(url, { params: params })
    .toPromise()
    .then((result:any)=>{
      const height: number = parseInt(result.height);
      return height;
    })
    .catch((error: any) => {
      this.messageService.warning('No height found.');
    });    

  }
}

