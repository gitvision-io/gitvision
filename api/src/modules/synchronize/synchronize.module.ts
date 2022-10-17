import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { RepoModule } from '../repo/repo.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';
import { SynchronizeController } from './synchronize.controller';
import { SynchronizeService } from './synchronize.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'sync-organization',
    }),
    UsersModule,
    RepoModule,
  ],
  controllers: [SynchronizeController],
  exports: [ProducerService],
  providers: [
    ProducerService,
    ConsumerService,
    UsersService,
    SynchronizeService,
  ],
})
export class SynchronizeModule {}
