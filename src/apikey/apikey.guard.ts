import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyService } from './apikey.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();
    const apiKey = process.env.API_KEY_PREFIX || 'x-api';
    if (type !== 'rpc') return false;

    const metadata = context.getArgByIndex(1);
    if (!metadata) {
      return false;
    }
    const apiVal = metadata.get(apiKey)[0];

    if (!apiVal) throw new RpcException(`No ${apiKey} key provided`);
    const isKeyValid = await this.apiKeyService.validateApiKey(apiVal);
    if (!isKeyValid) throw new RpcException('Invalid API key');

    return true;
  }
}
