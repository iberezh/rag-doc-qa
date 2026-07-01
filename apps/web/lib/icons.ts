import { API_BASE, errorMessage, jsonOf } from './api';

export interface IconResult {
  /** Full Iconify id, e.g. `solar:chat-round-bold`. */
  name: string;
  /** Inline SVG using `currentColor`. */
  svg: string;
}

export const ICON_STYLES = [
  'linear',
  'bold',
  'broken',
  'outline',
  'line-duotone',
  'bold-duotone',
] as const;
export type IconStyle = (typeof ICON_STYLES)[number];

export const isSolarIcon = (value: string): boolean => value.startsWith('solar:');

export async function searchIcons(
  q: string,
  style: IconStyle,
  signal?: AbortSignal,
): Promise<IconResult[]> {
  const params = new URLSearchParams({ q, style });
  const res = await fetch(`${API_BASE}/icons?${params.toString()}`, { signal: signal ?? null });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return (await jsonOf<{ icons: IconResult[] }>(res)).icons;
}

export async function getIconSvg(name: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${API_BASE}/icons/svg?name=${encodeURIComponent(name)}`, {
    signal: signal ?? null,
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return (await jsonOf<{ svg: string }>(res)).svg;
}

// A CSS-embeddable data URI, optionally recoloring the SVG's `currentColor`.
export function iconDataUri(svg: string, color?: string): string {
  const colored = color ? svg.replaceAll('currentColor', color) : svg;
  return `data:image/svg+xml;utf8,${encodeURIComponent(colored)}`;
}
