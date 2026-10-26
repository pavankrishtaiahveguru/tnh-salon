const publicMediaBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

function getPublicMediaBase() {
  if (!publicMediaBase) return null;
  try {
    const url = new URL(publicMediaBase);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return {
      origin: url.origin,
      path: url.pathname.replace(/\/+$/, ""),
    };
  } catch {
    return null;
  }
}

export function getSafeMediaUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const source = value.trim();
  if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) {
    return source;
  }

  const base = getPublicMediaBase();
  if (!base) return null;
  try {
    const url = new URL(source);
    if (
      url.protocol !== "https:" ||
      url.origin !== base.origin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (base.path && !url.pathname.startsWith(`${base.path}/`))
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
