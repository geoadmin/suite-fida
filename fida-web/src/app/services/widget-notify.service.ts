import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WidgetNotifyService {
  public onFeatureCreatedSubject: Subject<any>;
  
  constructor() { 
    this.onFeatureCreatedSubject = new Subject();
  }
}
