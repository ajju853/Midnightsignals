import * as fs from "fs";
import * as path from "path";
import { SEO_PAGES } from "./src/seoData";

const combos = [
  "/ocean-waves-and-rain",
  "/ocean-waves-and-crickets",
  "/ocean-waves-and-owl-sounds",
  "/songbirds-and-forest-breeze",
  "/rain-and-vinyl-crackles",
  "/neon-lofi-and-ocean-sounds",
];

const baseUrl = "https://midnight-signals.cloud"; // Production domain fallback
const currentDate = new Date().toISOString().split("T")[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Homepage
xml += `  <url>\n`;
xml += `    <loc>${baseUrl}/</loc>\n`;
xml += `    <lastmod>${currentDate}</lastmod>\n`;
xml += `    <changefreq>daily</changefreq>\n`;
xml += `    <priority>1.0</priority>\n`;
xml += `  </url>\n`;

// SEO Pages
for (const page of SEO_PAGES) {
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
}

// Custom Combo Presets
for (const comboPath of combos) {
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}${comboPath}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
}

xml += `</urlset>`;

try {
  // Write to public/sitemap.xml so Vite copies it to dist/ during build
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  console.log("Successfully generated public/sitemap.xml");

  // Also write to root sitemap.xml for completeness
  fs.writeFileSync(path.join(process.cwd(), "sitemap.xml"), xml, "utf8");
  console.log("Successfully generated sitemap.xml in root");
} catch (error) {
  console.error("Error generating sitemap.xml:", error);
}
