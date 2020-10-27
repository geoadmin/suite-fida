import { Component, ComponentRef, Injectable } from '@angular/core';
import { FeatureContainerComponent, FeatureMode } from '../components/feature/feature-container/feature-container.component'
import { ComponentService } from './component.service';
import PopupTemplate from 'esri/PopupTemplate';
import Feature from 'esri/Graphic';
import CustomContent from 'esri/popup/content/CustomContent';
import { FeatureState, FidaFeature } from '../models/FidaFeature.model';

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
            const feature: FidaFeature = result.graphic;
            feature.state = createMode === true ? FeatureState.Create : undefined;
            componentRef = self.componentService.createFeatureContainerComponent(feature);
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

