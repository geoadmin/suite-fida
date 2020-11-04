import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Geometry from 'esri/geometry/Geometry';


@Injectable({
  providedIn: 'root'
})
export class WidgetNotifyService {
  public onFeatureCreatedSubject: Subject<boolean>;
  public onGeometryEditSubject: Subject<Geometry>;
  public onGeometryEditCompleteSubject: Subject<Geometry>;
  public onGdbVersionChangedSubject: Subject<string>;

  constructor() {
    this.onFeatureCreatedSubject = new Subject();
    this.onGeometryEditSubject = new Subject();
    this.onGeometryEditCompleteSubject = new Subject();
    this.onGdbVersionChangedSubject = new Subject();
  }
}
