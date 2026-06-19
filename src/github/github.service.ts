import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

interface GithubProfile {
  name: string | null;
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  company: string | null;
  location: string | null;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
}

interface GithubHttpError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

@Injectable()
export class GithubService {
  private readonly githubApiUrl =
    process.env.GITHUB_API_URL || 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'NestJS-GitHub-Dashboard',
    };
    const pat = process.env.GITHUB_PAT;
    if (pat) {
      headers['Authorization'] = `token ${pat}`;
    }
    return headers;
  }

  async getUserProfile(username: string): Promise<GithubProfile> {
    const cacheKey = `github_profile_${username.toLowerCase()}`;
    const cachedData = await this.cacheManager.get<GithubProfile>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<GithubProfile>(
          `${this.githubApiUrl}/users/${username}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );
      const data = response.data;
      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes (600,000ms)
      return data;
    } catch (error) {
      const err = error as GithubHttpError;
      const status = err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        err.response?.data?.message || 'Erro ao buscar perfil do GitHub';
      throw new HttpException(message, status);
    }
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    const cacheKey = `github_repos_${username.toLowerCase()}`;
    const cachedData = await this.cacheManager.get<GithubRepo[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<GithubRepo[]>(
          `${this.githubApiUrl}/users/${username}/repos?per_page=100`,
          {
            headers: this.getHeaders(),
          },
        ),
      );
      const data = response.data;
      await this.cacheManager.set(cacheKey, data, 600000); // 10 minutes (600,000ms)
      return data;
    } catch (error) {
      const err = error as GithubHttpError;
      const status = err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        err.response?.data?.message || 'Erro ao buscar repositórios do GitHub';
      throw new HttpException(message, status);
    }
  }

  async getUserStats(username: string) {
    const profile = await this.getUserProfile(username);
    const repos = await this.getUserRepos(username);

    const langStats: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        langStats[repo.language] = (langStats[repo.language] || 0) + 1;
      }
    });

    const languages = Object.entries(langStats)
      .map(([name, count]) => ({
        name,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      profile: {
        name: profile.name || profile.login,
        login: profile.login,
        avatar_url: profile.avatar_url,
        bio: profile.bio || '',
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        html_url: profile.html_url,
        company: profile.company || '',
        location: profile.location || '',
      },
      stats: {
        totalStars,
        totalForks,
        languages,
      },
      repos: repos
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description || '',
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language || 'N/A',
          html_url: repo.html_url,
          updated_at: repo.updated_at,
        }))
        .sort((a, b) => b.stargazers_count - a.stargazers_count),
    };
  }
}
