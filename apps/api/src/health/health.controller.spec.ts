import { mockDeep } from 'jest-mock-extended';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  it('returns ok status when the database responds', async () => {
    const prisma = mockDeep<PrismaService>();
    prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
    const controller = new HealthController(prisma);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.db).toBe('up');
    expect(typeof result.uptime).toBe('number');
  });
});
