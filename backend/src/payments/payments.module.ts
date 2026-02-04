import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsModule } from '../projects/projects.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IzipayService } from './izipay.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';


@Module({
  imports: [PrismaModule, ProjectsModule, SubscriptionsModule, UsersModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, IzipayService ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
