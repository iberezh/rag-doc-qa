import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Bot } from '@prisma/client';
import { CurrentAccount } from '../auth/current-account.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { BotsService } from './bots.service';
import { CreateBotSchema, type CreateBotInput } from './schemas/create-bot.schema';
import { UpdateBotSchema, type UpdateBotInput } from './schemas/update-bot.schema';

@Controller('bots')
@UseGuards(JwtAuthGuard)
export class BotsController {
  constructor(private readonly bots: BotsService) {}

  @Get()
  list(@CurrentAccount() { accountId }: AuthContext): Promise<Bot[]> {
    return this.bots.list(accountId);
  }

  @Post()
  create(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(CreateBotSchema)) body: CreateBotInput,
  ): Promise<Bot> {
    return this.bots.create(accountId, body);
  }

  @Get(':botId')
  get(@CurrentAccount() { accountId }: AuthContext, @Param('botId') botId: string): Promise<Bot> {
    return this.bots.getOwned(accountId, botId);
  }

  @Patch(':botId')
  update(
    @CurrentAccount() { accountId }: AuthContext,
    @Param('botId') botId: string,
    @Body(new ZodValidationPipe(UpdateBotSchema)) body: UpdateBotInput,
  ): Promise<Bot> {
    return this.bots.update(accountId, botId, body);
  }

  @Delete(':botId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentAccount() { accountId }: AuthContext,
    @Param('botId') botId: string,
  ): Promise<void> {
    await this.bots.remove(accountId, botId);
  }
}
