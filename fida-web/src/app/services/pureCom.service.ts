import { Inject, Injectable } from '@angular/core';
import Geometry from '@arcgis/core/geometry/Geometry';
import Point from '@arcgis/core/geometry/Point';
import { ConfigService } from '../configs/config.service';
import { ParcelInfo } from '../models/ParcelInfo.model';
import { FeatureService } from './feature.service';
import { MessageService } from './message.service';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class PureComService {

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(QueryService) private queryService: QueryService,
    @Inject(MessageService) private messageService: MessageService
  ) { }

  public async getLang(geometry: Geometry): Promise<string> {
    try {
      const url = this.configService.getGpConfig().pureComUrl;
      const features = await this.queryService.intersect(url, geometry);

      // mappning
      // 0=de, 1=fr, 2=it, 3=rm (set 'de' for 'rm')
      const langMap = ['de', 'fr', 'it', 'de'];

      if (features.length > 0) {
        const langCom = features[0].attributes.COM_LANG;
        return langMap[langCom];
      }
    } catch (error) {
      this.messageService.error('PureCome-Call failed', error);
    }
  }
}
