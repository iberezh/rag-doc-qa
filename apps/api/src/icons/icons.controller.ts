import { Controller, Get, Query } from '@nestjs/common';
import { IconsService, type IconResult } from './icons.service';

// Serves Solar icons for the dashboard picker (static data — no auth, no DB).
@Controller('icons')
export class IconsController {
  constructor(private readonly icons: IconsService) {}

  @Get()
  search(@Query('q') q = '', @Query('style') style = 'linear'): { icons: IconResult[] } {
    return { icons: this.icons.search(q, style) };
  }

  // Resolves a single stored id (e.g. solar:chat-round-bold) to its SVG, for previewing.
  @Get('svg')
  one(@Query('name') name = ''): { svg: string } {
    return { svg: this.icons.render(name) };
  }
}
