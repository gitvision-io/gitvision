import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  imports: [HttpModule],
  exports: [NotificationsService],
  providers: [NotificationsService],
  controllers: [],
})
export class NotificationsModule {}
