import { ComponentRef, Injectable } from '@angular/core';
import { FeatureViewComponent } from '../components/feature/feature-view/feature-view.component'
import { ComponentService } from './component.service';
import PopupTemplate from 'esri/PopupTemplate';
import CustomContent from 'esri/popup/content/CustomContent';
import { FeatureState, FidaFeature } from '../models/FidaFeature.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  
  constructor(private componentService: ComponentService) {
  }

  public getFeatureTemplate(createMode?: boolean): PopupTemplate {
    let self = this;
    let componentRef: ComponentRef<FeatureViewComponent>;
    return new PopupTemplate({
      title: 'Feature {OBJECTID}',
      content: (result: any) => {
        const featureViewContent = new CustomContent({
          creator: () => {
            const feature: FidaFeature = result.graphic;
            feature.state = createMode === true ? FeatureState.Create : undefined;
            componentRef = self.componentService.createFeatureViewComponent(feature);
            return componentRef.location.nativeElement;
          },
          destroyer: () => {
            componentRef.destroy();
          }
        });

        return [featureViewContent];
      },
      outFields: ['*']
    });
  }
}

