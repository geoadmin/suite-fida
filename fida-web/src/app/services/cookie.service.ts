import { Injectable } from '@angular/core';
import {CookieService as NgxCookieService} from 'ngx-cookie-service';
import Extent from 'esri/geometry/Extent';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private mapExtentCookieName = 'MAP_EXTENT';  
  private gdbVersionCookieName = 'GDB_VERSION';


  constructor(private ngxCookieService: NgxCookieService) {}

  public get extent(): Extent {
    return this.getCookie(this.mapExtentCookieName);
  }

  public set extent(extent: Extent) {
    this.setCookie(this.mapExtentCookieName, extent.toJSON());
  }

  public get gdbVersionName(): string {
    return this.getCookie(this.gdbVersionCookieName);
  }

  public set gdbVersionName(gdbVersionName: string) {
    this.setCookie(this.gdbVersionCookieName, gdbVersionName);
  }

  private getCookie(name: string): any {
    if (this.ngxCookieService.check(name)) {
      return JSON.parse(this.ngxCookieService.get(name));
    }
    return undefined;
  }

  private setCookie(name: string, valueJson: any) {
    const valueString = JSON.stringify(valueJson);
    this.ngxCookieService.set(name, valueString, this.expires);
  }

  private get expires(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
  }
}
