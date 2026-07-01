import { Injectable, NotFoundException } from '@nestjs/common';
import { getIconData, iconToSVG } from '@iconify/utils';
import solar from '@iconify-json/solar/icons.json';

// Solar ships every icon in six style variants, encoded as a name suffix.
const STYLES = ['linear', 'bold', 'broken', 'outline', 'line-duotone', 'bold-duotone'] as const;
const NAMES = Object.keys(solar.icons);
const SEARCH_LIMIT = 120;

export interface IconResult {
  /** Full Iconify id, e.g. `solar:chat-round-bold` — what we store on the bot. */
  name: string;
  /** Inline SVG using `currentColor`, so the caller sets the color via CSS. */
  svg: string;
}

@Injectable()
export class IconsService {
  /** Renders a Solar icon to an inline SVG string (id may be `solar:foo-bold` or `foo-bold`). */
  render(id: string): string {
    const key = id.startsWith('solar:') ? id.slice('solar:'.length) : id;
    const data = getIconData(solar, key);
    if (!data) {
      throw new NotFoundException('Icon not found');
    }
    const { attributes, body } = iconToSVG(data, { height: '1em' });
    const attrs = Object.entries(attributes)
      .map(([key2, value]) => `${key2}="${String(value)}"`)
      .join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;
  }

  /** A stored launcher value is a Solar id (→ SVG) or a plain emoji (→ null). Never throws, so a
   * stale/invalid stored id can't 500 the public config the widget depends on. */
  launcherSvg(value: string): string | null {
    if (!value.startsWith('solar:')) return null;
    try {
      return this.render(value);
    } catch {
      return null;
    }
  }

  /** Whether a Solar id resolves to a real icon (id may be `solar:foo-bold` or `foo-bold`). */
  resolves(id: string): boolean {
    const key = id.startsWith('solar:') ? id.slice('solar:'.length) : id;
    return getIconData(solar, key) !== null;
  }

  search(query: string, style: string, limit = SEARCH_LIMIT): IconResult[] {
    const suffix = (STYLES as readonly string[]).includes(style) ? style : 'linear';
    const needle = query.trim().toLowerCase();
    const results: IconResult[] = [];
    for (const name of NAMES) {
      if (!name.endsWith(`-${suffix}`)) continue;
      if (needle && !name.slice(0, -(suffix.length + 1)).includes(needle)) continue;
      results.push({ name: `solar:${name}`, svg: this.render(name) });
      if (results.length >= limit) break;
    }
    return results;
  }
}
