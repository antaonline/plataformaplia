import { Module } from '@nestjs/common'
import { CyberpanelModule } from '../integrations/cyberpanel/cyberpanel.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [PrismaModule, CyberpanelModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
