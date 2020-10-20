import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';

import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {
  @ViewChild('map', { static: true }) private mapContainer: ElementRef;

  constructor(private mapservice: MapService) {}

  async ngOnInit(): Promise<any> { 
    await this.mapservice.initMap(this.mapContainer);
  }
}
