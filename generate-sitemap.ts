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

// Helper function to extract actual file system modification date
const getFileModDate = (relativeFilePath: string): string => {
  try {
    const fullPath = path.join(process.cwd(), relativeFilePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return stats.mtime.toISOString().split("T")[0];
    }
  } catch (e) {
    console.warn(`Could not fetch stats for ${relativeFilePath}, falling back to today.`);
  }
  return new Date().toISOString().split("T")[0];
};

// Fetch real modified timestamps based on code integrity limits
const homepageModDate = getFileModDate("src/App.tsx");
const seoDataModDate = getFileModDate("src/seoData.ts");
const infographicModDate = getFileModDate("src/components/EmbeddableInfographic.tsx");
const serverModDate = getFileModDate("server.ts");

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 1. Homepage
xml += `  <url>\n`;
xml += `    <loc>${baseUrl}/</loc>\n`;
xml += `    <lastmod>${homepageModDate}</lastmod>\n`;
xml += `    <changefreq>daily</changefreq>\n`;
xml += `    <priority>1.0</priority>\n`;
xml += `  </url>\n`;

// 2. Interactive Science Infographic Page (Linkable Asset)
xml += `  <url>\n`;
xml += `    <loc>${baseUrl}/science-of-lofi-focus-infographic</loc>\n`;
xml += `    <lastmod>${infographicModDate}</lastmod>\n`;
xml += `    <changefreq>weekly</changefreq>\n`;
xml += `    <priority>0.9</priority>\n`;
xml += `  </url>\n`;

// 3. Dynamic Curated SEO Pages
for (const page of SEO_PAGES) {
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
  xml += `    <lastmod>${seoDataModDate}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
}

// 4. Custom Combo Presets
for (const comboPath of combos) {
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}${comboPath}</loc>\n`;
  xml += `    <lastmod>${serverModDate}</lastmod>\n`;
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
  console.log("Successfully generated public/sitemap.xml with precise file mod dates.");

  // Also write to root sitemap.xml for completeness
  fs.writeFileSync(path.join(process.cwd(), "sitemap.xml"), xml, "utf8");
  console.log("Successfully generated sitemap.xml in root with precise file mod dates.");
} catch (error) {
  console.error("Error generating sitemap.xml:", error);
}
