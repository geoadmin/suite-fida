import { Injectable } from '@angular/core';
import Geometry from 'esri/geometry/Geometry';
import Feature from 'esri/Graphic';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WidgetNotifyService {
  public onFeatureCreatedSubject: Subject<boolean>;
  public onGeometryEditSubject: Subject<Geometry>;
  public onGeometryEditCompleteSubject: Subject<Geometry>;

  constructor() {
    this.onFeatureCreatedSubject = new Subject();
    this.onGeometryEditSubject = new Subject();
    this.onGeometryEditCompleteSubject = new Subject();
  }
}
