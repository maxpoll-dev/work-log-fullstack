import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { SessionGuard } from '../../session/session.guard';

@Controller('work-units')
@UseGuards(SessionGuard)
export class UnitsController {
  constructor(private readonly units: UnitsService) {}

  @Get()
  @ApiOperation({ operationId: 'workUnitsList', summary: 'Единицы измерения' })
  @ApiOkResponse({ description: 'Список единиц измерения' })
  list() {
    return this.units.list();
  }
}
