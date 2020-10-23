import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

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

  public error(title: string, body?: string) {
    this.notificationsService.error(
      title, 
      body ? this.formatError(body) : null,
      {
        timeOut: this.TIMEOUT
      });
  }

  private formatError(error: any): string {
    let errors: string [] = [];
    if(error.message){
      errors.push(error.message);
    }
    if(error.details && error.details.messages){
      errors.concat(error.messages);
    }
    if(errors.length === 0){
      errors.push(error);
    }

    return errors.join('. ');
  }
}
