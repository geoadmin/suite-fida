import { Component, Inject, LOCALE_ID } from '@angular/core';
import { FidaTranslateService } from './services/translate.service';
import { ConfigService } from './configs/config.service';
import { CookieService } from './services/cookie.service';
import { LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fida-web';

  constructor(
    private translateService: FidaTranslateService,
    private cookieService: CookieService,
    private configService: ConfigService
  ) {
    const languages = this.configService.getLanguages();
    const currentLanguage = this.cookieService.language || languages[0];
    this.translateService.setLanguages(languages);
    this.translateService.setCurrentLanguage(currentLanguage);

    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cookieService.language = event.lang;
    });
  }
}
