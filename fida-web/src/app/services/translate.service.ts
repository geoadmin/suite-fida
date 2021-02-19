import { EventEmitter, Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationCacheService } from './translation-cache.service';

@Injectable({
  providedIn: 'root'
})
export class FidaTranslateService {

  constructor(
    private translateService: TranslateService,
    private translationCacheService: TranslationCacheService
  ) { }

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

  public getTranslatedCodedValueNamesByLang(domain: CodedValueDomain, language: string): string[] {
    const keys = domain.codedValues.map(m => this.getCodedValueKey(domain, m));
    return this.translateList(keys, language);
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

  public translateList(keys: string[], language: string): string[] {
    // WARNING: if a translation of not current language is needed, do not use translationService
    // because this will cause problems with the current-language settings...
    if (language) {
      return this.instantByLang(keys, language);
    } else {
      return this.translateService.instant(keys);
    }
  }

  private instantByLang(keys: string[], language: string): string[] {
    const databaseTranslation = this.translationCacheService.getDatabaseTranslation(language);
    const translations: string[] = [];
    // order of key must mirrow the translation
    keys.forEach(key => {
      const translation = databaseTranslation[key] || key;
      translations.push(translation);
    });
    return translations;
  }
}
