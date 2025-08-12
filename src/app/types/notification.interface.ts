import { MessageStatus } from "./message-status.enum";

export interface Notification {
  messageId: string;
  messageContent: string;
  status: MessageStatus;
}