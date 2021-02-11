import { EventEmitter, Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
      const key = this.getCodedValueKey(domain, codedValue);
      const translation = this.translateService.instant(key);
      if (key !== translation) {
        codedValue.name = translation;
      }
    });
    return domain;
  }

  public getTranslatedCodedValueNamesByLang(domain: CodedValueDomain, lang: string): Observable<string[]> {
    const keys = domain.codedValues.map(m => this.getCodedValueKey(domain, m));
    return this.translateService.getTranslation(lang.toLocaleLowerCase()).pipe(map(translations => {
      return keys.map(key => translations[key]);
    }));
  }

  private getCodedValueKey(domain: CodedValueDomain, codedValue: any): string {
    const domainName = domain.name.toLocaleLowerCase();
    const code = codedValue.code.toString().toLocaleLowerCase();
    return `domain.${domainName}.${code}`;
  }

  public translateAttributeName(layerName: string, attributeName: string): string {
    const key = `row.${layerName.toLocaleLowerCase()}.${attributeName.toLocaleLowerCase()}`;
    const translation = this.translateService.instant(key);
    if (key !== translation) {
      return translation;
    }
    return attributeName;
  }

  public translate(key: string): string {
    return this.translateService.instant(key);
  }
}
