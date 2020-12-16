import { Component, ViewEncapsulation } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
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
    public translateService: TranslateService
  ) {
  }

  getLanguages(): string[] {
    return this.translateService.getLangs().slice().reverse();
  }

  isCurrentLanguage(language: string): boolean {
    return this.translateService.currentLang === language;
  }

  setCurrentLanguage(language: string): void {
    this.translateService.setDefaultLang(language);
    this.translateService.use(language);
  }

  getLanguageShort(languageId: string): string {
    return languageId?.toUpperCase().substring(0, languageId.indexOf('-'));
  }

  getUserName(): string {
    return this.settingService.user?.fullName;
  }

  getVersionName(): string {
    return UtilService.formatVersionName(this.settingService.getGdbVersionName());
  }
}
