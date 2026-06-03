import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { ListJournalQuery } from './dto/list-journal.query';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { SessionGuard } from '../../session/session.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

import type { AuthenticatedUser } from '../../auth/auth-user.types';

@Controller('journal')
@UseGuards(SessionGuard)
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  @ApiOperation({
    operationId: 'journalList',
    summary: 'Журнал работ',
    description:
      'Журналы всех пользователей. Пагинация, фильтр по дате, фильтр по пользователю, сортировка по дате.',
  })
  @ApiOkResponse({
    description: 'Постраничный список - 30 записей по умолчанию',
  })
  list(@Query() query: ListJournalQuery) {
    return this.journal.list(query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'journalGet', summary: 'Запись журнала по id' })
  findOne(@Param('id') id: string) {
    return this.journal.findOne(id);
  }

  @Post()
  @ApiOperation({ operationId: 'journalCreate', summary: 'Создать запись' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJournalDto,
  ) {
    return this.journal.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'journalUpdate',
    summary: 'Редактировать запись (только владелец)',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journal.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'journalDelete',
    summary: 'Удалить запись (только владелец)',
  })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.journal.remove(user.id, id);
  }
}
