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
      body ? body : null,
      {
        timeOut: this.TIMEOUT
      });
  }
}
