import { Controller, Get } from '@nestjs/common';
import { HalooglasiService } from './halooglasi.service';

@Controller('halooglasi')
export class HalooglasiController {
  constructor(
    private readonly halooglasiService: HalooglasiService,
  ) {}

  @Get()
  start(): string {
    this.halooglasiService.startScrap();
    return 'started';
  }
}
