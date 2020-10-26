import { Component, ComponentRef, Injectable } from '@angular/core';
import { FeatureContainerComponent, FeatureMode } from '../components/feature/feature-container/feature-container.component'
import { ComponentService } from './component.service';
import PopupTemplate from 'esri/PopupTemplate';
import Feature from 'esri/Graphic';
import CustomContent from 'esri/popup/content/CustomContent';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  
  constructor(private componentService: ComponentService) {
  }

  public getFeatureTemplate(createMode?: boolean): PopupTemplate {
    let self = this;
    let componentRef: ComponentRef<FeatureContainerComponent>;
    return new PopupTemplate({
      title: 'Feature {OBJECTID}',
      content: (result: any) => {
        const featureContainerContent = new CustomContent({
          creator: () => {
            const feature: Feature = result.graphic;
            const featureMode: FeatureMode = createMode === true ? FeatureMode.Create : FeatureMode.View;
            componentRef = self.componentService.createFeatureContainerComponent(feature, featureMode);
            return componentRef.location.nativeElement;
          },
          destroyer: () => {
            componentRef.destroy();
          }
        });

        return [featureContainerContent];
      },
      outFields: ['*']
    });
  }
}

