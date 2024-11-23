import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the account',
    minimum: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'The new password for the account',
    minimum: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Confirm new password - must match newPassword',
    minimum: 6,
  })
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}
