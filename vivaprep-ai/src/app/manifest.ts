import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VivaPrep AI - Smart Study Platform",
    short_name: "VivaPrep",
    description:
      "Upload lectures, generate quizzes, flashcards, viva questions and more with AI",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
