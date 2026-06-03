import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const entryInclude = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  workType: { select: { id: true, name: true } },
  unitType: { select: { id: true, name: true } },
} satisfies Prisma.WorkLogEntryInclude;

@Injectable()
export class JournalRepository {
  constructor(private readonly prisma: PrismaService) {}

  listAndCount(
    where: Prisma.WorkLogEntryWhereInput,
    order: Prisma.SortOrder,
    skip: number,
    take: number,
  ) {
    return this.prisma.$transaction([
      this.prisma.workLogEntry.findMany({
        where,
        orderBy: { createdAt: order },
        skip,
        take,
        include: entryInclude,
      }),
      this.prisma.workLogEntry.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.workLogEntry.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: entryInclude,
    });
  }

  findByOwner(id: string) {
    return this.prisma.workLogEntry.findFirst({
      where: { id, status: 'PUBLISHED' },
      select: { userId: true },
    });
  }

  create(data: Prisma.WorkLogEntryUncheckedCreateInput) {
    return this.prisma.workLogEntry.create({ data });
  }

  update(id: string, data: Prisma.WorkLogEntryUncheckedUpdateInput) {
    return this.prisma.workLogEntry.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.workLogEntry.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }
}
