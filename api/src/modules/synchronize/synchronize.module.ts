import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { RepoModule } from '../repo/repo.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { QueueAdminController } from './admin.controller';
import { ConsumerCronService } from './consumer-cron.service';
import { ConsumerService } from './consumer.service';
import { ProducerCronService } from './producer-cron.service';
import { ProducerService } from './producer.service';
import {
  CRON_SYNCHRONIZATION_QUEUE,
  USER_SYNCHRONIZATION_QUEUE,
} from './synchronize.constants';
import { SynchronizeController } from './synchronize.controller';
import { SynchronizeService } from './synchronize.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue(
      {
        name: USER_SYNCHRONIZATION_QUEUE,
      },
      {
        name: CRON_SYNCHRONIZATION_QUEUE,
      },
    ),
    UsersModule,
    RepoModule,
  ],
  controllers: [SynchronizeController, QueueAdminController],
  exports: [ProducerService],
  providers: [
    ProducerService,
    ProducerCronService,
    ConsumerService,
    ConsumerCronService,
    UsersService,
    SynchronizeService,
  ],
})
export class SynchronizeModule {}
