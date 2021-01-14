import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/configs/config.service';
import { FidaDifferenceFeature } from 'src/app/models/Difference.model';

@Component({
  selector: 'app-difference-list-tree',
  templateUrl: './difference-list-tree.component.html',
  styleUrls: ['./difference-list-tree.component.scss']
})
export class DifferenceListTreeComponent implements OnInit {
  @Input() differenceFeatures: FidaDifferenceFeature[];
  @Input() title: string;
  @Input() componentId: string;
  @Input() showAll: boolean;

  constructor(private configService: ConfigService) { }

  ngOnInit(): void {
  }

  getFeatureName(differenceFeature: FidaDifferenceFeature): string {
    const layerConfig = this.configService.getLayerConfigByName(differenceFeature.layerName);
    const idAttribute = differenceFeature.attributes.find(f => f.name === layerConfig.idField);
    return `${layerConfig.properties.id}-${idAttribute?.versionValue?.toString()}`;
  }

  getId(prefix: string, differenceFeature: FidaDifferenceFeature): string {
    return `${prefix}-${differenceFeature?.globalId.replace('{', '').replace('}', '')}`;
  }

  getDiffClass(differenceFeature: FidaDifferenceFeature): string {
    return 'diff-dark-' + differenceFeature.state?.toString();
  }

}
