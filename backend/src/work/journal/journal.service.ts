import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { JournalRepository } from './journal.repository';

import type { ListJournalQuery } from './dto/list-journal.query';
import type { CreateJournalDto } from './dto/create-journal.dto';
import type { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly repo: JournalRepository) {}

  async list(q: ListJournalQuery) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (q.from !== undefined) createdAt.gte = new Date(q.from);
    if (q.to !== undefined) createdAt.lte = new Date(q.to);

    const where: Prisma.WorkLogEntryWhereInput = {
      status: 'PUBLISHED',
      ...(q.userId !== undefined ? { userId: q.userId } : {}),
      ...(q.from !== undefined || q.to !== undefined ? { createdAt } : {}),
    };

    const skip = (q.page - 1) * q.limit;
    const [items, total] = await this.repo.listAndCount(
      where,
      q.order,
      skip,
      q.limit,
    );

    return {
      items,
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    };
  }

  async findOne(id: string) {
    const entry = await this.repo.findById(id);
    if (entry === null)
      throw new NotFoundException({ code: 'ENTRY_NOT_FOUND' });

    return entry;
  }

  create(userId: string, dto: CreateJournalDto) {
    return this.repo.create({
      userId,
      typeId: dto.typeId,
      unitId: dto.unitId,
      amount: dto.amount,
      comment: dto.comment,
    });
  }

  async update(userId: string, id: string, dto: UpdateJournalDto) {
    await this.ensureOwner(userId, id);
    return this.repo.update(id, dto);
  }

  async remove(userId: string, id: string) {
    await this.ensureOwner(userId, id);
    await this.repo.softDelete(id);
  }

  private async ensureOwner(userId: string, id: string) {
    const entry = await this.repo.findByOwner(id);

    if (entry === null)
      throw new NotFoundException({ code: 'ENTRY_NOT_FOUND' });
    if (entry.userId !== userId)
      throw new ForbiddenException({ code: 'NOT_OWNER' });
  }
}
