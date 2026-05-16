import { createFileRoute } from "@tanstack/react-router";
import PatternPress from "@/components/PatternPress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pattern Press — Wear your code" },
      { name: "description", content: "Design and download a baby onesie printed with your own Python-style code. A premium tool for developers." },
      { property: "og:title", content: "Pattern Press — Wear your code" },
      { property: "og:description", content: "Design and download a baby onesie printed with your own Python-style code." },
    ],
  }),
  component: PatternPress,
});
