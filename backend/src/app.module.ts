import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { PlansModule } from './plans/plans.module'
import { AuthModule } from './auth/auth.module'
import { ProjectsModule } from './projects/projects.module';
import { OrdersController } from './orders/orders.controller';
import { ProjectsService } from './projects/projects.service';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DomainsModule } from './domains/domains.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AiModule } from './ai/ai.module';
import { CyberpanelModule } from './integrations/cyberpanel/cyberpanel.module';
import { NextExportModule } from './integrations/next-export/next-export.module';
import { RenewHostingCron } from './cron/renew-hosting.cron';
import { PublishProjectsCron } from './cron/publish-projects.cron';
import { TrialCron } from './cron/trial.cron';
import { CustomDomainDriftCron } from './cron/custom-domain-drift.cron';
import { AffiliateReversalCron } from './cron/affiliate-reversal.cron';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';
import { HostingModule } from './hosting/hosting.module';
import { AiChatModule } from './experimental/iachat/iachat.module';
import { SandboxModule } from './experimental/sandbox/sandbox.module';
import { PreviewModule } from './experimental/preview/preview.module';
import { SiteContactModule } from './site-contact/site-contact.module';
import { AffiliatesModule } from './affiliates/affiliates.module';

import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100, // default suave
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PlansModule,
    UsersModule,
    ProjectsModule,
    OrdersModule,
    PaymentsModule,
    DomainsModule,
    CheckoutModule,
    AiModule,
    CyberpanelModule,
    NextExportModule,
    MailModule,
    ContactModule,
    HostingModule,
    AiChatModule,
    SandboxModule,
    PreviewModule,
    SiteContactModule,
    AffiliatesModule,
  ],
  controllers: [AppController, OrdersController],
  providers: [
    AppService,
    ProjectsService,
    RenewHostingCron,
    PublishProjectsCron,
    CustomDomainDriftCron,
    TrialCron,
    AffiliateReversalCron,
  ],
})
export class AppModule {}

