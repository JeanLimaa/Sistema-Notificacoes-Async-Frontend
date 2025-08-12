import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../../types/notification.interface';
import { MessageStatus } from '../../types/message-status.enum';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'], 
  standalone: false
})
export class NotificationComponent implements OnInit, OnDestroy {
  messageContent = '';
  notifications: Notification[] = [];
  pollingInterval: any;

  constructor(private notificationService: NotificationService) {}

  sendNotification() {
    if (!this.messageContent.trim()) return;

    const messageId = uuidv4();

    this.notificationService.sendNotification(messageId, this.messageContent).subscribe((res: Notification) => {
      this.notifications.push({ 
        messageId, 
        messageContent: this.messageContent, 
        status: res.status || MessageStatus.WAITING_PROCESSING 
      });
      this.messageContent = '';
    });
  }

  ngOnInit() {
    this.pollingInterval = setInterval(() => {
      for (const notification of this.notifications) {
        if (notification.status !== MessageStatus.WAITING_PROCESSING) {
          continue;
        }

        this.notificationService.getStatus(notification.messageId).subscribe((res: Notification) => {
          if (res.status && res.status !== notification.status) {
            notification.status = res.status;
          }
        });
      }
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.pollingInterval);
  }

  mapStatus(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.WAITING_PROCESSING:
        return 'Aguardando processamento';
      case MessageStatus.PROCESSING_SUCCESS:
        return 'Notificação processada com sucesso';
      case MessageStatus.NOT_FOUND:
        return 'Notificação não encontrada';
      default:
        return 'Status desconhecido';
    }
  }
}