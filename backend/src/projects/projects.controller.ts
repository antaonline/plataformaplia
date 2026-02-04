import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/onboarding')
  async onboarding(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.projectsService.saveOnboarding(
      id,
      {
        step: body.step ?? 1,
        data: body.data ?? body,
        completed: body.completed ?? false,
      },
    );
  }

}
