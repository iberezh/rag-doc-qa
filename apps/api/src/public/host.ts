/** Extract the bare hostname from an origin URL or a bare hostname string. */
function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value.trim().toLowerCase();
  }
}

/**
 * Best-effort allowlist for a public widget: an empty list means "embed anywhere",
 * otherwise the candidate origin's hostname must be listed. (A public embed key is
 * inherently visible, so this gates casual abuse rather than being a hard secret.)
 * Matching is exact hostname equality — `example.com` does not cover `www.example.com`.
 */
export function hostAllowed(allowedDomains: string[], candidate: string | undefined): boolean {
  if (allowedDomains.length === 0) {
    return true;
  }
  if (!candidate) {
    return false;
  }
  const host = hostnameOf(candidate);
  return allowedDomains.some((domain) => hostnameOf(domain) === host);
}
