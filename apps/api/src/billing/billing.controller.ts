import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentAccount } from '../auth/current-account.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { AppConfigService } from '../config/app-config.service';
import { ZodValidationPipe } from '../shared/pipes/zod-validation.pipe';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import type { BillingStatus, CheckoutResult } from './billing.types';
import { CheckoutSchema, type CheckoutInput } from './schemas/checkout.schema';
import { ConfirmSchema, type ConfirmInput } from './schemas/confirm.schema';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly stripe: StripeService,
    private readonly config: AppConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  status(@CurrentAccount() { accountId }: AuthContext): Promise<BillingStatus> {
    return this.billing.status(accountId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(CheckoutSchema)) body: CheckoutInput,
  ): Promise<CheckoutResult> {
    return this.billing.checkout(accountId, body.plan, `${this.config.corsOrigin}/app`);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  confirm(
    @CurrentAccount() { accountId }: AuthContext,
    @Body(new ZodValidationPipe(ConfirmSchema)) body: ConfirmInput,
  ): Promise<BillingStatus> {
    return this.billing.confirmCheckout(accountId, body.sessionId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async portal(@CurrentAccount() { accountId }: AuthContext): Promise<{ url: string }> {
    return { url: await this.billing.portal(accountId, `${this.config.corsOrigin}/app`) };
  }

  // Public: Stripe calls this. Trust comes from the signature, verified against the raw body.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }
    const event = this.stripe.constructEvent(req.rawBody, signature);
    await this.billing.applyEvent(event);
    return { received: true };
  }
}
