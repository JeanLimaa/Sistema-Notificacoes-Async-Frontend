import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationComponent } from '../../components/notification/notification.component';
import { NotificationService } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MessageStatus } from '../../types/message-status.enum';

describe('NotificationComponent', () => {
    let component: NotificationComponent;
    let fixture: ComponentFixture<NotificationComponent>;
    let serviceSpy: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('NotificationService', ['sendNotification', 'getStatus']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [NotificationComponent],
            providers: [{ provide: NotificationService, useValue: spy }],
        });

        fixture = TestBed.createComponent(NotificationComponent);
        component = fixture.componentInstance;
        serviceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    });

    it('should generate messageId, send POST and add notification to the list', () => {
        spyOn(component, 'generateMessageId').and.returnValue('mocked-uuid-123');
        serviceSpy.sendNotification.and.returnValue(of({
            messageId: 'mocked-uuid-123',
            messageContent: 'Test message',
            status: MessageStatus.WAITING_PROCESSING,
        }));

        component.messageContent = 'Test message';
        component.sendNotification();

        expect(serviceSpy.sendNotification).toHaveBeenCalledWith('mocked-uuid-123', 'Test message');
        expect(component.notifications.length).toBe(1);
        expect(component.notifications[0].messageId).toBe('mocked-uuid-123');
        expect(component.notifications[0].messageContent).toBe('Test message');
        expect(component.notifications[0].status).toBe(MessageStatus.WAITING_PROCESSING);
    });

    it('should update status via polling', fakeAsync(() => {
        const messageId = 'mocked-uuid-123';
        component.notifications = [{
            messageId,
            messageContent: 'Test message',
            status: MessageStatus.WAITING_PROCESSING,
        }];

        serviceSpy.getStatus.and.returnValue(of({
            messageId,
            messageContent: 'Test message',
            status: MessageStatus.PROCESSING_SUCCESS,
        }));

        component.ngOnInit();

        tick(3000); // avançar 3 segundos para o polling disparar

        expect(serviceSpy.getStatus).toHaveBeenCalledWith(messageId);
        expect(component.notifications[0].status).toBe(MessageStatus.PROCESSING_SUCCESS);

        component.ngOnDestroy();
    }));
});