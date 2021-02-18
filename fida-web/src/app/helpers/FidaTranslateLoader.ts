import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import Query from '@arcgis/core/tasks/support/Query';
import Feature from '@arcgis/core/Graphic';
import { from, Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../configs/config.service';
import { FidaFeature } from '../models/FidaFeature.model';

export class FidaTranslateLoader implements TranslateLoader {
  private databaseTranslations: any = {};

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService
  ) { }

  public getTranslation(lang: string): Observable<any> {
    return zip(this.loadAppTranslations(lang), this.loadDatabaseTranslations(lang))
      .pipe(map((x: any) => ({ ...x[0], ...x[1] })));
  }

  private loadAppTranslations(lang: string): Observable<any> {
    return this.httpClient.get(`assets/i18n/${lang}.json`);
  }

  private loadDatabaseTranslations(lang: string): Observable<any> {
    const databaseTranslation: any = this.databaseTranslations[lang];

    if (databaseTranslation) {
      return of(databaseTranslation);
    }

    return this.loadAndConvertDatabaseTranslations().pipe(map(() => {
      return this.databaseTranslations[lang];
    }));
  }

  private loadAndConvertDatabaseTranslations(): Observable<any> {
    return this.url(this.configService.getTranslateTableUrl()).pipe(map((features: FidaFeature[]) => {
      this.databaseTranslations = this.createEmptyDatabaseTranslations();

      features.forEach(feature => {
        const translationKey = this.getDatabaseTranslationKey(feature);
        const valDict = JSON.parse(feature.attributes.VALDICT);

        // check dictionary
        if (valDict == null) {
          console.error(`invalid translation: `, feature.attributes);
        }

        // convert db-dictionary to specific language lists
        for (const langKey of Object.keys(this.databaseTranslations)) {
          const translation = valDict[langKey];
          if (translation) {
            this.databaseTranslations[langKey][translationKey] = translation;
          }
        }
      });
    }));
  }

  private createEmptyDatabaseTranslations(): any {
    const languages = this.configService.getLanguages();

    const databaseTranslation: any = {};
    languages.forEach(language => {
      databaseTranslation[language] = {};
    });
    return databaseTranslation;
  }

  private getDatabaseTranslationKey(feature: Feature): string {
    //TODO app einbinden
    const type = feature.attributes.OBJEKTART === 0 ? 'domain' : 'row';
    const group = feature.attributes.GRUPPENAME.toLowerCase();
    const key = feature.attributes.KEY.toLowerCase();
    return `${type}.${group}.${key}`;
  }

  private url(url: string): Observable<any> {
    const query = new Query();
    query.where = '1=1';
    query.outFields = ['*'];

    const queryTask = new QueryTask();
    queryTask.url = url;

    return from(new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(result.features))
        .catch((error: any) => {
          reject(error);
        });
    }));
  }
}
