import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TypesService } from './types.service';
import { SessionGuard } from '../../session/session.guard';

@Controller('work-types')
@UseGuards(SessionGuard)
export class TypesController {
  constructor(private readonly types: TypesService) {}

  @Get()
  @ApiOperation({ operationId: 'workTypesList', summary: 'Типы работ' })
  @ApiOkResponse({ description: 'Список типов работ' })
  list() {
    return this.types.list();
  }
}
