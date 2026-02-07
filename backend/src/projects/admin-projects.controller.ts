import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list() {
    return this.projectsService.listForAdmin();
  }

  @Get(':id')
  find(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findForAdmin(id);
  }

  @Post(':id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { publicUrl?: string },
  ) {
    return this.projectsService.publishProject(id, body);
  }

  @Post(':id/db-setup')
  dbSetup(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      dbName?: string;
      dbUser?: string;
      dbPassword?: string;
    },
  ) {
    return this.projectsService.configureDb(id, body);
  }
}
