import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import EsriError from 'esri/core/Error';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private TIMEOUT = 5000;

  constructor(private notificationsService: NotificationsService) { }

  public success(title: string, body?: string): void {
    this.notificationsService.success(
      title,
      body ? body : null,
      {
        timeOut: this.TIMEOUT
      });
  }

  public warning(title: string, body?: string): void {
    this.notificationsService.warn(title, body ? body : null);
  }

  public error(title: string, error?: EsriError): void {
    this.notificationsService.error(title, error ? this.formatError(error) : undefined);
  }

  private formatError(error: EsriError): string {
    let errors: string[] = [error.name];

    if (error.message) {
      errors.push(error.message);
    }
    if (error.details && error.details.messages) {
      errors = errors.concat(error.details.messages);
    }

    return errors.join('. ');
  }
}
