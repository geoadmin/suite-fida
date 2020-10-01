import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
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
  @ViewChild('map', { static: true }) private mapViewElement: ElementRef;

  constructor(private mapservice: MapService) {}

  ngOnInit(): void {
    this.mapservice.initMap(this.mapViewElement.nativeElement);
  }
}
