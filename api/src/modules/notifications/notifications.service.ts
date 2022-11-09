import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/entities/user.entity';
import { UserDTO } from '../users/users.dto';

export interface Notification {
  event:
    | 'new_user'
    | 'checkout_pro'
    | 'subscribed_pro'
    | 'canceled_pro'
    | 'synchronize_job_created'
    | 'synchronize_job_ended'
    | 'synchronize_job_error'
    | 'synchronize_public_job_created'
    | 'synchronize_public_job_ended'
    | 'synchronize_public_job_error';
  data: Record<string, unknown>;
}

const userKeysToExclude = ['repos', 'gitProviderId', 'gitProviderToken'];

@Injectable()
export class NotificationsService {
  #notificationWebhookUrl: string;
  #currentUser: UserDTO;

  constructor(private readonly httpService: HttpService) {
    this.#notificationWebhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  }

  setCurrentUser(user: User) {
    this.#currentUser = user;
  }

  async notify(notification: Notification) {
    if (!this.#notificationWebhookUrl) {
      console.info('No notification url setup. skipping notification');
      return;
    }
    await firstValueFrom(
      await this.httpService.post(this.#notificationWebhookUrl, {
        content: `new event: "${
          notification.event
        }" with data: ${JSON.stringify(
          {
            ...Object.fromEntries(
              Object.entries(this.#currentUser || {}).filter(
                ([k]) => !userKeysToExclude.includes(k),
              ),
            ),
            ...notification.data,
          },
          null,
          4,
        )}`,
      }),
    );
  }
}
