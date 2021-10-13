import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
}

export type GenderType = keyof typeof GenderEnum;

export interface SignatureToken {
  signature: string;
  id: number;
  sub: string;
  exp: number;
}

export class CommonDTO {
  @IsEnum(GenderEnum)
  @ApiProperty({
    example: GenderEnum.MALE,
    default: GenderEnum.MALE,
    description: '성별',
  })
  gender: GenderType;
}
