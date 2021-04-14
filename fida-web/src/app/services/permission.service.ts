import { Injectable } from '@angular/core';
import { SettingService } from './setting.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private settingService: SettingService) { }

  /*hasPermission(permission: PermissionType): boolean {
    // check default version
    if (permission === PermissionType.EDIT && !this.settingService.isDefaultVersion()) {
      return true;
    }

    return false;
  }
  */

  hasEditPermission(): boolean {
    return !this.settingService.isDefaultVersion();
  }
}
