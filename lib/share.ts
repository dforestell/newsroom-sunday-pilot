import type { Metadata } from "next";
import { siteUrl } from "./site.ts";

const image = "/brand/wordmark-bar.png";

/** Page metadata with a canonical URL and share tags on the public origin. `path` is the page path, e.g. "/calls". */
export function shareMetadata(title: string, description: string, path: string): Metadata {
  const url = siteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `Poor Form Sports · ${title}`,
      description,
      siteName: "Poor Form Sports",
      type: "website",
      images: [{ url: siteUrl(image), alt: "Poor Form Sports" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Poor Form Sports · ${title}`,
      description,
      images: [siteUrl(image)],
    },
  };
}
