import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { MessageStatus } from '../types/message-status.enum';

describe('NotificationService', () => {
    let service: NotificationService;
    let httpMock: HttpTestingController;

    const apiBaseUrl = 'http://localhost:3000/api/notifications';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NotificationService],
        });
        service = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Garante que não sobra requisição pendente
    });

    it('should send notification with POST and return response', () => {
        const messageId = 'test-id-123';
        const messageContent = 'Test notification message';

        service.sendNotification(messageId, messageContent).subscribe((res) => {
            expect(res).toBeTruthy();
            expect(res.messageId).toBe(messageId);
            expect(res.status).toBe(MessageStatus.WAITING_PROCESSING);
        });

        const req = httpMock.expectOne(apiBaseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ messageId, messageContent });

        req.flush({ messageId, status: MessageStatus.WAITING_PROCESSING });
    });

    it('should get notification status with GET and return status', () => {
        const messageId = 'test-id-123';

        service.getStatus(messageId).subscribe((res) => {
            expect(res).toBeTruthy();
            expect(res.messageId).toBe(messageId);
            expect(res.status).toBe(MessageStatus.PROCESSING_SUCCESS);
        });

        const req = httpMock.expectOne(`${apiBaseUrl}/status/${messageId}`);
        expect(req.request.method).toBe('GET');

        req.flush({ messageId, status: MessageStatus.PROCESSING_SUCCESS });
    });

    it('should handle errors gracefully on sendNotification', () => {
        const messageId = 'fail-id';
        const messageContent = 'Fail message';

        service.sendNotification(messageId, messageContent).subscribe({
            next: () => fail('Deveria falhar'),
            error: (error) => {
                expect(error.status).toBe(500);
            },
        });

        const req = httpMock.expectOne(apiBaseUrl);
        req.flush('Erro interno', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle errors gracefully on getStatus', () => {
        const messageId = 'fail-id';

        service.getStatus(messageId).subscribe({
            next: () => fail('Deveria falhar'),
            error: (error) => {
                expect(error.status).toBe(404);
            },
        });

        const req = httpMock.expectOne(`${apiBaseUrl}/status/${messageId}`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
});