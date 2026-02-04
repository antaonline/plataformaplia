import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common'
import { PlansService } from './plans.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'

@ApiTags('Plans')
@ApiBearerAuth('access-token')
@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar planes (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.plansService.findAll(+page, +limit)
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear plan (solo ADMIN)' })
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto)
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar plan (solo ADMIN)' })
  @ApiParam({ name: 'id', example: 1 })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(+id, dto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar plan (solo ADMIN)' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id)
  }
}
