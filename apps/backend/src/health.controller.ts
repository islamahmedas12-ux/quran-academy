import { Controller, Get } from '@nestjs/common';
import { Public } from './shared/decorators';

@Controller()
export class HealthController {
  @Get('health')
  @Public()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
