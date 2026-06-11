import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthStatus {
  status: 'ok';
  uptime: number;
  db: 'up';
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    // Throws if the database is unreachable — a failing /health is a valid signal.
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', uptime: process.uptime(), db: 'up' };
  }
}
