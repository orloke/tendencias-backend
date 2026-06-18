import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('stats/:username')
  async getStats(@Param('username') username: string) {
    return this.githubService.getUserStats(username);
  }
}
