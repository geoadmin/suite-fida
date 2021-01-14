import { Injectable } from '@angular/core';
import { FidaFeature, RelationshipName } from '../models/FidaFeature.model';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /**
   * FORMAT METHODS
   */

  public static formatVersionName(versionName: string): string {
    if (versionName) {
      const split = versionName.split('@ADB.');
      if (split.length > 1) {
        return split[split.length - 1];
      }
    }
    return versionName;
  }


  public static formatDateTime(date: Date): string {
    return date.toLocaleString();
  }

  public static formatDate(date: Date, format?: string): string {
    if (date == null) {
      return;
    }
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = date.getFullYear();

    switch (format) {
      case 'yyyy-mm-dd':
        return `${yyyy}-${mm}-${dd}`;
      default:
        return `${dd}.${mm}.${yyyy}`;
    }
  }

  /**
   * CONVERT METHODS
   */

  public static esriToDate(date: any): Date {
    if (date == null) {
      return undefined;
    }
    return new Date(date);
  }

  public static dateToEsri(date: any): any {
    if (date == null) {
      return null;
    }
    if (typeof date.getMonth === 'function') {
      return (date as Date).getMilliseconds;
    }
    return date;
  }

  /**
   * TO LINE METHODS
   */

  public static getVornameNameToLine(feature: FidaFeature): string {
    const list: string[] = [];
    this.addToList(list, feature.attributes.VORNAME);
    this.addToList(list, feature.attributes.NAME);
    return list.join(' ');
  }

  public static getPlzOrtToLine(feature: FidaFeature): string {
    const list: string[] = [];
    this.addToList(list, feature.attributes.PLZ);
    this.addToList(list, feature.attributes.ORT);
    return list.join(' ');
  }

  public static kontaktToLine(feature: FidaFeature): string {
    const list: string[] = [];
    this.addToList(list, feature.attributes.ART);
    this.addToList(list, feature.attributes.FIRMA);
    this.addToList(list, this.getVornameNameToLine(feature));
    this.addToList(list, feature.attributes.ADRESSE);
    this.addToList(list, this.getPlzOrtToLine(feature));
    this.addToList(list, feature.attributes.EMAIL);
    this.addToList(list, feature.attributes.TELEFON);

    return list.join(', ');
  }

  public static addToList(list: string[], value: any): void {
    if (value != null && value.trim() !== '') {
      list.push(value);
    }
  }

  /**
   * HEADER METHODS
   */

  public static getFeatureHeader(feature: FidaFeature, relationshipName?: RelationshipName): string {
    if (relationshipName === RelationshipName.grundbuch) {
      return `${feature.attributes.GEMEINDE} - ${feature.attributes.PARZ}`;
    }

    if (relationshipName === RelationshipName.auslandpunkt) {
      return feature.attributes.PUNKTNAME;
    }

    if (relationshipName === RelationshipName.nachfuehrung) {
      const date = this.esriToDate(feature.attributes.NACHFUEHRUNGSDATUM);
      return this.formatDate(date, 'yyyy-mm-dd') || '-no date-';
    }

    if (relationshipName === RelationshipName.rueckversicherung) {
      return feature.attributes.PUNKTBEZEICHNUNG || '- no name -';
    }

    if (relationshipName === RelationshipName.schaeden) {
      const date = this.esriToDate(feature.attributes.DATUM);
      return this.formatDate(date, 'yyyy-mm-dd') || '-no date-';
    }

    if (relationshipName === RelationshipName.schweremessung) {
      const date = this.esriToDate(feature.attributes.DATUM);
      return this.formatDate(date, 'yyyy-mm-dd') || '-no date-';
    }
  }
}