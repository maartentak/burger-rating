import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Patty Petrol",
    short_name: "Patty Petrol",
    description:
      "The Patty Patrol's private burger-rating rig. Rate the burger, rate the joint, crown the best patty in town.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F1E5",
    theme_color: "#F6F1E5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
