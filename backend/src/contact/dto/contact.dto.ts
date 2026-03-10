import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  business?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
