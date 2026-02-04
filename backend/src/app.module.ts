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
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService, ProjectsService],
})
export class AppModule {}

