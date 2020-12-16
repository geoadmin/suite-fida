import { Component, Inject, LOCALE_ID } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ConfigService } from './configs/config.service';
import { CookieService } from './services/cookie.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fida-web';

  constructor(
    private translateService: TranslateService,
    private cookieService: CookieService,
    private configService: ConfigService
  ) {
    const languages = this.configService.getLanguages();
    const currentLanguage = this.cookieService.language || languages[0];
    this.translateService.addLangs(languages);
    this.translateService.setDefaultLang(currentLanguage);
    this.translateService.use(currentLanguage);

    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cookieService.language = event.lang;
    });
  }
}
