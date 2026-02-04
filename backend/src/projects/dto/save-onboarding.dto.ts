import { IsInt, IsObject, IsOptional } from 'class-validator';

export class SaveOnboardingDto {
  @IsInt()
  step: number;

  @IsObject()
  data: any;

  @IsOptional()
  completed?: boolean;
}
