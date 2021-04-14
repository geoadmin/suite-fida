import { Inject, Injectable } from '@angular/core';
import PortalUser from '@arcgis/core/portal/PortalUser';
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
    @Inject(WidgetNotifyService) private widgetNotifyService: WidgetNotifyService,
    @Inject(CookieService) private cookieService: CookieService,
    @Inject(ConfigService) private configSevice: ConfigService) {
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

  public isDefaultVersion(): boolean {
    return this.gdbVersionName === this.configSevice.getDefaultVersionName();
  }
}
