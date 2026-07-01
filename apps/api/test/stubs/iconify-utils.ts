// Test stub for @iconify/utils, which is ESM-only and can't be parsed by the Jest (CommonJS)
// transform. Real icon rendering is covered by integration/live checks; unit specs mock
// IconsService and the e2e config uses emoji-launcher bots, so these no-ops are never exercised.
export function getIconData(): null {
  return null;
}

export function iconToSVG(): { attributes: Record<string, string>; body: string } {
  return { attributes: {}, body: '' };
}
