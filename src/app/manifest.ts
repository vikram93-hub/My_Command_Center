import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "My Command Center",
    short_name: "Command Center",
    description: "Your private personal command center, synced across devices.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0c10",
    theme_color: "#0b0c10",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
