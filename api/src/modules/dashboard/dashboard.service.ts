import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

@Injectable()
export class DashboardService {}
