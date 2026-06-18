import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

@Module({
  imports: [HttpModule, CacheModule.register(), UsersModule],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
