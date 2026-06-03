import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workType.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
