import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GithubService } from './github.service';

@ApiTags('GitHub')
@ApiBearerAuth()
@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('stats/:username')
  @ApiOperation({ summary: 'Obter estatísticas do GitHub de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas recuperadas com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getStats(@Param('username') username: string) {
    return this.githubService.getUserStats(username);
  }
}
