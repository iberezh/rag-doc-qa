import { Controller, Get } from '@nestjs/common';

interface HealthStatus {
  status: 'ok';
  uptime: number;
}

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return { status: 'ok', uptime: process.uptime() };
  }
}
