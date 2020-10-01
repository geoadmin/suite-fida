import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WidgetNotifyService {
  public onShowFeatureSubject: Subject<any>;
  
  constructor() { 
    this.onShowFeatureSubject = new Subject();
  }
}
