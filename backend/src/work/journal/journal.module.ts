import { Module } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './journal.repository';

@Module({
  controllers: [JournalController],
  providers: [JournalService, JournalRepository],
})
export class JournalModule {}
