import { Injectable } from '@nestjs/common';
import { UnitsRepository } from './units.repository';

@Injectable()
export class UnitsService {
  constructor(private readonly repo: UnitsRepository) {}

  list() {
    return this.repo.findAll();
  }
}
