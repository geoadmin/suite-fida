import { Component, ViewEncapsulation } from '@angular/core';
import { FidaTranslateService } from 'src/app/services/translate.service';
import { SettingService } from 'src/app/services/setting.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {

  constructor(
    private settingService: SettingService,
    public translateService: FidaTranslateService
  ) {
  }

  getLanguages(): string[] {
    return this.translateService.getLanguages();
  }

  isCurrentLanguage(language: string): boolean {
    return this.translateService.getCurrentLanguage() === language;
  }

  setCurrentLanguage(language: string): void {
    this.translateService.setCurrentLanguage(language);
  }

  getLanguageName(languageId: string): string {
    return languageId?.toUpperCase();
  }

  getUserName(): string {
    return this.settingService.user?.fullName;
  }

  getVersionName(): string {
    return UtilService.formatVersionName(this.settingService.getGdbVersionName());
  }
}
