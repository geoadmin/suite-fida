import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FidaFeature } from '../models/FidaFeature.model';

export enum CompleteState {
  Saved = 'saved',
  Canceld = 'canceld',
  Closed = 'closed'
}

@Injectable({
  providedIn: 'root'
})
export class WidgetNotifyService {
  public onGeometryEditSubject: Subject<FidaFeature>;
  public onGeometryEditCompleteSubject: Subject<CompleteState>;
  public onFeatureEditSubject: Subject<FidaFeature>;
  public onFeatureEditCompleteSubject: Subject<CompleteState>;
  public onFeatureCreateCompleteSubject: Subject<CompleteState>;
  public onGdbVersionChangedSubject: Subject<string>;

  constructor() {
    this.onFeatureCreateCompleteSubject = new Subject();
    this.onGeometryEditSubject = new Subject();
    this.onGeometryEditCompleteSubject = new Subject();
    this.onFeatureEditSubject = new Subject();
    this.onFeatureEditCompleteSubject = new Subject();
    this.onGdbVersionChangedSubject = new Subject();
  }
}
