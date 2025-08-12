import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../types/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  sendNotification(messageId: string, messageContent: string): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications`, { messageId, messageContent });
  }

  getStatus(messageId: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/notifications/status/${messageId}`);
  }
}
