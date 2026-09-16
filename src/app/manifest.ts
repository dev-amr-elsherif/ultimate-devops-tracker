import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ultimate DevOps & Cloud Engineering Master Roadmap",
    short_name: "DevOps Tracker",
    description:
      "Interactive mission command terminal & curriculum tracker for DevOps, Linux, AWS, Kubernetes, Terraform, CI/CD, and Observability.",
    start_url: "/",
    display: "standalone",
    background_color: "#050814",
    theme_color: "#050814",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
