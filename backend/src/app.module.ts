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
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';

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
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService, ProjectsService, RenewHostingCron, PublishProjectsCron],
})
export class AppModule {}

