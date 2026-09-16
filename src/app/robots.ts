import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://dev-amr-elsherif.github.io/ultimate-devops-tracker/sitemap.xml",
  };
}
