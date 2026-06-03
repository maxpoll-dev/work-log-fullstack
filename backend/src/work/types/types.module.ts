import { Module } from '@nestjs/common';
import { TypesController } from './types.controller';
import { TypesService } from './types.service';
import { TypesRepository } from './types.repository';

@Module({
  controllers: [TypesController],
  providers: [TypesService, TypesRepository],
})
export class TypesModule {}
