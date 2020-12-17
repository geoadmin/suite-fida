import { EventEmitter, Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';

@Injectable({
  providedIn: 'root'
})
export class FidaTranslateService {

  constructor(private translateService: TranslateService) { }

  public getCurrentLanguage(): string {
    return this.translateService.currentLang;
  }

  public setCurrentLanguage(language: string): void {
    this.translateService.setDefaultLang(language);
    this.translateService.use(language);
  }

  public getLanguages(): string[] {
    return this.translateService.getLangs().reverse();
  }

  public setLanguages(languages: string[]): void {
    this.translateService.addLangs(languages);
  }

  get onLangChange(): EventEmitter<LangChangeEvent> {
    return this.translateService.onLangChange;
  }

  public translateCodedValueDomain(domain: CodedValueDomain): CodedValueDomain {
    domain.codedValues.forEach((codedValue: any) => {
      const domainName = domain.name.toLocaleLowerCase();
      const code = codedValue.code.toString().toLocaleLowerCase();
      const key = `domain.${domainName}.${code}`;
      const translation = this.translateService.instant(key);
      if (key !== translation) {
        codedValue.name = translation;
      }
    });
    return domain;
  }

  public translate(key: string): string {
    return this.translateService.instant(key);
  }
}
