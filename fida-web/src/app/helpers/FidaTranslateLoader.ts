import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import Feature from 'esri/widgets/Feature';
import { Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';

export class FidaTranslateLoader implements TranslateLoader {

  constructor(private httpClient: HttpClient) { }

  public getTranslation(lang: string): Observable<any> {

    return zip(this.loadAppTranslations(lang), this.loadFeatureTranslations(lang))
      .pipe(map((x: any) => ({ ...x[0], ...x[1] })));
  }

  private loadAppTranslations(lang: string): Observable<any> {
    console.log('load app-translation:', lang);
    return this.httpClient.get(`assets/i18n/${lang}.json`);
  }

  private loadFeatureTranslations(lang: string): Observable<any> {
    const url = 'https://s7t2530a.adr.admin.ch/arcgis/rest/services/FIDA/FIDA/FeatureServer/17/';
    const result = this.url(url).then((features) => {
      console.log('load feature-translation:', lang);
      return { fida: 'Tester Service' } as any;
    });
    return of({ user: 'Benutzer' });
    // return new Observable(result);
  }

  public url(url: string): Promise<Feature[]> {
    const query = new Query();
    query.where = '1=1';
    query.outFields = ['*'];

    const queryTask = new QueryTask();
    queryTask.url = url;

    return new Promise((resolve, reject) => {
      queryTask.execute(query)
        .then((result: any) => resolve(result.features))
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
