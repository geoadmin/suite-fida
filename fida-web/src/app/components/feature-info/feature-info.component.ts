import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WidgetsService } from 'src/app/services/widgets.service'
import { WidgetNotifyService } from 'src/app/services/widget-notify.service'
import Feature from 'esri/Graphic'

@Component({
  selector: 'app-feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss']
})
export class FeatureInfoComponent implements OnInit {
  @ViewChild('featureInfo', { static: true }) private featureInfoElement: ElementRef;
  public feature: Feature;

  constructor(
    private widgetsService: WidgetsService,
    private widgetNotifyService: WidgetNotifyService
    ) { }

  ngOnInit(): void {
    this.widgetsService.registerFeatureInfoContent(this.featureInfoElement);
    this.widgetNotifyService.onShowFeatureSubject.subscribe(feature => {
      this.feature = feature;
    });
  }
}
