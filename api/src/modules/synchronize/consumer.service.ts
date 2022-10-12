import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SynchronizeJob } from './producer.service';

@Processor('sync-organization')
export class ConsumerService {
  @Process()
  async transcode(job: Job<SynchronizeJob>) {
    console.log(job.data);
    return {};
  }
}
