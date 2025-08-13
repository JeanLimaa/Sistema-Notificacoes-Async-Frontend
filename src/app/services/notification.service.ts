import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Notification } from '../types/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  sendNotification(messageId: string, messageContent: string): Observable<Notification> {
    return this.http
      .post<Notification>(`${this.apiUrl}/notifications`, { messageId, messageContent })
      .pipe(
        catchError(this.handleError)
      );
  }

  getStatus(messageId: string): Observable<Notification> {
    return this.http
      .get<Notification>(`${this.apiUrl}/notifications/status/${messageId}`)
      .pipe(
        catchError(this.handleError)  
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Ocorreu um erro:', error);
    return throwError(() => error);
  }
}