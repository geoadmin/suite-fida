import { Component, Inject, LOCALE_ID } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
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
    private cookieService: CookieService
  ) {
    const language = this.cookieService.language || 'de-CH';
    this.setLanguages(language);
    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cookieService.language = event.lang;
    });
  }

  private setLanguages(language: string): void {
    this.translateService.addLangs(['de-CH', 'fr-CH', 'it-CH']);
    this.translateService.setDefaultLang(language);
    this.translateService.use(language);
  }

}
