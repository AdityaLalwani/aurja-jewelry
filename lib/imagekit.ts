type ImageKitTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
};

type ImageKitLoaderOptions = {
  src: unknown;
  width: number;
  quality?: number;
};

export function normalizeImageSource(src: unknown): string {
  if (typeof src === "string") {
    return src;
  }

  if (src !== null && typeof src === "object") {
    const candidate =
      typeof (src as { src?: unknown }).src === "string"
        ? (src as { src: string }).src
        : typeof (src as { url?: unknown }).url === "string"
          ? (src as { url: string }).url
          : null;

    if (candidate) {
      return candidate;
    }

    for (const value of Object.values(src as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
}

export function getImageKitUrl(
  src: string,
  { width, height, quality = 75 }: ImageKitTransformOptions = {},
): string {
  let imageUrl: URL;
  try {
    imageUrl = new URL(src);
  } catch {
    return src;
  }

  const isImageKitHost = imageUrl.hostname === "ik.imagekit.io";
  const endpointValue = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (endpointValue) {
    const endpoint = new URL(endpointValue);
    const endpointPath = endpoint.pathname.endsWith("/")
      ? endpoint.pathname
      : `${endpoint.pathname}/`;
    if (
      (imageUrl.origin !== endpoint.origin ||
        !imageUrl.pathname.startsWith(endpointPath)) &&
      !isImageKitHost
    ) {
      return src;
    }
  } else if (!isImageKitHost) {
    return src;
  }

  const transformations = [
    width ? `w-${Math.round(width)}` : undefined,
    height ? `h-${Math.round(height)}` : undefined,
    `q-${Math.round(quality)}`,
    "f-auto",
  ]
    .filter(Boolean)
    .join(",");
  imageUrl.searchParams.set("tr", transformations);
  return imageUrl.toString();
}

export function imageKitLoader({
  src,
  width,
  quality,
}: ImageKitLoaderOptions): string {
  const resolvedSrc = normalizeImageSource(src);
  return resolvedSrc ? getImageKitUrl(resolvedSrc, { width, quality }) : "";
}
