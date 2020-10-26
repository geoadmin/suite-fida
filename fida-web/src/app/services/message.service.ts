import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import EsriError from 'esri/core/Error';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private TIMEOUT:number = 5000;

  constructor(private notificationsService: NotificationsService) { }

  public success(title: string, body?: string) {
    this.notificationsService.success(
      title, 
      body ? body : null,
      {
        timeOut: this.TIMEOUT
      });
  }

  public error(title: string, error: EsriError) {
    this.notificationsService.error(
      title, 
       this.formatError(error),
      {
        timeOut: this.TIMEOUT
      });
  }

  private formatError(error: EsriError): string {
    let errors: string [] = [error.name];
    
    if(error.message){
      errors.push(error.message);
    }
    if(error.details && error.details.messages){
      errors.concat(error.details.messages);
    }
    
    return errors.join('. ');
  }
}
