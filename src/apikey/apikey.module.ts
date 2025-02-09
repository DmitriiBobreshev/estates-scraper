import { Module } from '@nestjs/common';
import { ApiKeyService } from './apikey.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './apikey.guard';

@Module({
  providers: [
    ApiKeyService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
  exports: [ApiKeyService],
})
export class ApikeyModule {}
