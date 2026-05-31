/** Extract a YouTube video id from common URL shapes or a bare 11-char id. */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const shortMatch = trimmed.match(/youtu\.be\/([^?&/\s]+)/i);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([^?&/\s]+)/i);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^?&/\s]+)/i);
  if (shortsMatch?.[1]) return shortsMatch[1];

  const watchMatch = trimmed.match(/[?&]v=([^?&/\s]+)/i);
  if (watchMatch?.[1]) return watchMatch[1];

  const vMatch = trimmed.match(/youtube\.com\/v\/([^?&/\s]+)/i);
  if (vMatch?.[1]) return vMatch[1];

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
