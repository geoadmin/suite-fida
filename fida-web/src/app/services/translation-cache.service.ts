import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationCacheService {
  private databaseTranslations: any;

  constructor() { }

  public setDatabaseTranslations(databaseTranslations: any): void {
    this.databaseTranslations = databaseTranslations;
  }

  public getDatabaseTranslation(language: string): any {
    if (this.databaseTranslations) {
      return this.databaseTranslations[language.toLocaleLowerCase()];
    }
  }

  public createEmptyDatabaseTranslations(languages: string[]): any {
    const databaseTranslations: any = {};
    languages.forEach(language => {
      databaseTranslations[language.toLocaleLowerCase()] = {};
    });
    return databaseTranslations;
  }

}
