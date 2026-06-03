import { Injectable } from '@nestjs/common';
import { TypesRepository } from './types.repository';

@Injectable()
export class TypesService {
  constructor(private readonly repo: TypesRepository) {}

  list() {
    return this.repo.findAll();
  }
}
