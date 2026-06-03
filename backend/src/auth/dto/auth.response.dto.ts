import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @ApiProperty()
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  email!: string;

  @ApiProperty({ enum: ['CLIENT'] })
  @Expose()
  role!: 'CLIENT';
}
