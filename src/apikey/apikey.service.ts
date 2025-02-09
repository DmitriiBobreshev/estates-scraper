import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyService {

  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === process.env.API_KEY;
  }
}
