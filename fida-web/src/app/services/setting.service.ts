import { Injectable } from '@angular/core';
import PortalUser from 'esri/portal/PortalUser';
import { ConfigService } from '../configs/config.service';
import { CookieService } from './cookie.service';
import { WidgetNotifyService } from './widget-notify.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private gdbVersionName: string;
  public user: PortalUser;

  constructor(
    private widgetNotifyService: WidgetNotifyService,
    private cookieService: CookieService,
    private configSevice: ConfigService) {
    this.gdbVersionName = this.cookieService.gdbVersionName || this.configSevice.getDefaultVersionName();
  }

  public setGdbVersionName(gdbVersionName: string): void {
    this.gdbVersionName = gdbVersionName;
    this.cookieService.gdbVersionName = this.gdbVersionName;
    this.widgetNotifyService.onGdbVersionChangedSubject.next(this.gdbVersionName);
  }

  public getGdbVersionName(): string {
    return this.gdbVersionName;
  }

  public setDefaultVersion(): void {
    this.setGdbVersionName(this.configSevice.getDefaultVersionName());
  }
}
