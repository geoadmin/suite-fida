import { Injectable } from '@angular/core';
import { SettingService } from './setting.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private settingService: SettingService) { }

  hasEditPermission(): boolean {
    return !this.settingService.isDefaultVersion();
  }

  hasAdminPermission(): boolean {
    return this.settingService.isAdmin;
  }
}
