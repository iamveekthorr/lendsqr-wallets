import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { AuthDTO } from './dto/auth.dto';
import { RegistrationDTO } from './dto/registration.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() authDTO: AuthDTO) {
    return this.authService.login(authDTO);
  }

  @Post('create-account')
  create(@Body() registrationDTO: RegistrationDTO) {
    return this.authService.create(registrationDTO);
  }
}
