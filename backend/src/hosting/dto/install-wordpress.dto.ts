import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstallWordPressDto {
  @ApiProperty({ example: 'My Awesome Blog' })
  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  wpUser: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  wpPass: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  wpEmail: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  installPath?: string;
}
