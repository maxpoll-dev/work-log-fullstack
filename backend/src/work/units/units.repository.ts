import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UnitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workUnit.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
