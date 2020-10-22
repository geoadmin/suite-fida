import { Injectable } from '@angular/core';
import { FeatureMode } from '../components/feature/feature-container/feature-container.component'
import PopupTemplate from 'esri/PopupTemplate';
import Feature from 'esri/Graphic';
import { ComponentService } from './component.service';

@Injectable({ providedIn: 'root' })
export class TemplateService {

  constructor(private componentService: ComponentService) {
  }

  public getFeatureTemplate(createMode?: boolean): PopupTemplate {
    let self = this;
    return new PopupTemplate({
      title: 'Population in {OBJECTID}',
      content: (result: any) => {
        //return this.createFeatureComponent(feature);
        const feature: Feature = result.graphic;
        const featureMode: FeatureMode = createMode === true ? FeatureMode.Create : FeatureMode.View;
        return self.componentService.createFeatureContainerComponent(feature, featureMode).nativeElement;
      },
      outFields: ['*']
    });
  }
}

