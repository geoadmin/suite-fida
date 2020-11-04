import { Component, ViewEncapsulation } from '@angular/core';
import { SettingService } from 'src/app/services/setting.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  currentLanguage: string;
  languages: Array<string>;  

  constructor(private settingService: SettingService) {
  }

  getUserName(): string {
    return this.settingService.user?.fullName;
  }

  getVersionName(): string {
    return this.settingService.getGdbVersionName();
  }
}
