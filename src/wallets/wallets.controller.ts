import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '~/auth/decorators/current-user.decorator';
import { Roles } from '~/auth/decorators/roles.decorator';
import { RolesGuard } from '~/auth/guards/role.guard';
import { AppAuthGuard } from '~/auth/guards/auth.guard';
import { Role } from '~/auth/role.enum';
import { User } from '~/users/dto/users.dto';

import { WalletsService } from './wallets.service';

import { CreateWalletDTO } from './dto/create-wallet.dto';
import { CreateTransferDTO } from './dto/create-transfers.dto';
import { FundWalletDTO } from './dto/fund-wallet.dto';
import { WithdrawalDTO } from './dto/withdrawal.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  create(@Body() data: CreateWalletDTO, @CurrentUser() user: User) {
    return this.walletsService.create(data, user.id);
  }
  @Get()
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  getWallets(@CurrentUser() user: User) {
    return this.walletsService.getWallets(user.id);
  }

  @Get(':id')
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  getWallet(@Param('id') id: string, @CurrentUser() user: User) {
    return this.walletsService.getWallet(id, user.id);
  }

  @Delete(':id')
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.walletsService.delete(id, user.id);
  }

  @Post('/transfer')
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  transfer(
    @Body() createWalletsDto: CreateTransferDTO,
    @CurrentUser() user: User,
  ) {
    return this.walletsService.transfer(createWalletsDto, user.id);
  }
  @Post('/fund')
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  fund(@Body() fundWalletDto: FundWalletDTO, @CurrentUser() user: User) {
    return this.walletsService.fund(fundWalletDto, user.id);
  }

  @Post('/withdraw')
  @UseGuards(AppAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  withdraw(@Body() withdrawalDto: WithdrawalDTO, @CurrentUser() user: User) {
    return this.walletsService.withdraw(withdrawalDto, user.id);
  }
}
