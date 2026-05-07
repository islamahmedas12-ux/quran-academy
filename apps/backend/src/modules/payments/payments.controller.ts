import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionTiersService } from './services/subscription-tiers.service';
import { OrganizationSubscriptionsService } from './services/organization-subscription.service';
import { TeacherPayoutsService } from './services/teacher-payouts.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../shared/decorators';
import type Stripe from 'stripe';

interface RequestWithUser extends Request {
  user: { id: string; role: Role; [key: string]: any };
}

@Controller()
export class PaymentsController {
  constructor(
    private readonly tiersService: SubscriptionTiersService,
    private readonly subscriptionsService: OrganizationSubscriptionsService,
    private readonly payoutsService: TeacherPayoutsService,
  ) {}

  @Get('subscriptions/plans')
  async listPlans() {
    return this.tiersService.findAll();
  }

  @Post('organizations/:id/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async createSubscription(
    @Param('id') id: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createCheckout(id, dto.tierType, dto.successUrl, dto.cancelUrl);
  }

  @Patch('organizations/:id/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async updateSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(id, dto.tierType);
  }

  @Get('organizations/:id/subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Param('id') id: string) {
    return this.subscriptionsService.getOrCreateSubscription(id);
  }

  @Delete('organizations/:id/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async cancelSubscription(@Param('id') id: string) {
    await this.subscriptionsService.cancelSubscription(id);
    return { success: true };
  }

  @Get('organizations/:id/subscription/portal')
  @UseGuards(JwtAuthGuard)
  async getCustomerPortal(@Param('id') id: string) {
    return this.subscriptionsService.getCustomerPortal(id);
  }

@Post('webhooks/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: Stripe.Event,
  ) {
    const payload = Buffer.from(JSON.stringify(body));
    const event = await this.subscriptionsService.verifyAndHandleWebhook(payload, signature);
    return { received: true };
  }

  @Get('teachers/:id/earnings')
  @UseGuards(JwtAuthGuard)
  async getTeacherEarnings(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.id !== id && user.role !== Role.ORG_ADMIN) {
      return { error: 'Access denied' };
    }
    return this.payoutsService.getTeacherEarnings(id);
  }

  @Get('teachers/:id/earnings/summary')
  @UseGuards(JwtAuthGuard)
  async getEarningsSummary(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.id !== id && user.role !== Role.ORG_ADMIN) {
      return { error: 'Access denied' };
    }
    return this.payoutsService.getEarningsSummary(id);
  }

  @Patch('teachers/:id/earnings/:month/:year/mark-paid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_ADMIN)
  async markEarningsPaid(
    @Param('id') id: string,
    @Param('month') month: number,
    @Param('year') year: number,
  ) {
    return this.payoutsService.markAsPaid(id, month, year);
  }
}
