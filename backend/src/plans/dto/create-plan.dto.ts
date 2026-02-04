import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsBoolean } from 'class-validator'

export class CreatePlanDto {
  @ApiProperty({ example: 'Landing Page' })
  @IsString()
  name: string

  @ApiProperty({ example: 'Web simple' })
  @IsString()
  description: string

  @ApiProperty({ example: 390 })
  @IsNumber()
  price: number

  @ApiProperty({ example: true })
  @IsBoolean()
  hostingYear?: boolean
}
