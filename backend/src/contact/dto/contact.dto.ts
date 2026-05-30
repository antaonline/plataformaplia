import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  // Acepta formatos comunes: "+51 999 999 999", "999-999-999", "(01)234-5678",
  // "999999999". Rechaza basura tipo "asdfg" o cadenas demasiado cortas/largas.
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[\d\s+()-]{6,40}$/, {
    message:
      'El teléfono debe tener entre 6 y 40 caracteres y solo dígitos, espacios y +()-',
  })
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  business?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  // ─── Honeypot anti-spam ───
  // Campo invisible que solo bots llenan. Si llega con contenido,
  // rechazamos. Usamos un nombre genérico ("website") porque los
  // scrapers atacan nombres comunes.
  @IsOptional()
  @IsString()
  @MaxLength(0, {
    message: 'spam_detected',
  })
  website?: string;
}
