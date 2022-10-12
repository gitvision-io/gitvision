import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sync-organization',
    }),
  ],
  exports: [ProducerService],
  providers: [ProducerService, ConsumerService],
})
export class SynchronizeModule {}
