export function assetUrl(path: string): string {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path)) return path
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`
}
