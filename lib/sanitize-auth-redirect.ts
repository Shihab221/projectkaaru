/** Safe in-app targets for `/auth?redirect=`. Rejects protocol-relative URLs and open redirects. */
export function sanitizeAuthRedirect(
  raw: string | null | undefined,
  fallback: string = "/"
): string {
  if (!raw || typeof raw !== "string") return fallback;

  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }

  decoded = decoded.trim();

  if (decoded.length > 512) return fallback;

  if (!decoded.startsWith("/")) return fallback;

  if (decoded.startsWith("//")) return fallback;

  if (decoded.includes("://")) return fallback;

  if (decoded.includes("\\") || decoded.includes("\0")) return fallback;

  if (/\s/.test(decoded)) return fallback;

  return decoded;
}
