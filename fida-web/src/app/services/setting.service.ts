import { Injectable } from '@angular/core';
import PortalUser from 'esri/portal/PortalUser';
import { WidgetNotifyService } from './widget-notify.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private gdbVersionName : string = 'SDE.DEFAULT';
  public user: PortalUser;

  constructor(private widgetNotifyService: WidgetNotifyService) { }

  public setGdbVersionName(gdbVersionName: string){
    this.gdbVersionName = gdbVersionName;
    this.widgetNotifyService.onGdbVersionChangedSubject.next(this.gdbVersionName);
  }

  public getGdbVersionName(): string{
    return this.gdbVersionName;
  }
}
