import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateJournalDto {
  @ApiProperty({ description: 'Вид работ - ID' })
  @IsString()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({ description: 'Единица измерения - ID' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ description: 'Объём', example: 15.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Комментарий' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
