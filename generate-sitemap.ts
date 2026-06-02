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

  // Generate a valid high-contrast 32x32 pixels favicon.ico
  generateFavicon();
} catch (error) {
  console.error("Error generating sitemap.xml or favicon.ico:", error);
}

function generateFavicon() {
  const publicDir = path.join(process.cwd(), "public");
  const faviconPath = path.join(publicDir, "favicon.ico");

  // Create the ICO buffer
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = Icon
  header.writeUInt16LE(1, 4); // Number of images = 1

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0);   // Width 32
  dirEntry.writeUInt8(32, 1);   // Height 32
  dirEntry.writeUInt8(0, 2);    // Color count (0 for 256+)
  dirEntry.writeUInt8(0, 3);    // Reserved
  dirEntry.writeUInt16LE(1, 4);  // Planes = 1
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel = 32
  dirEntry.writeUInt32LE(4264, 8); // Size of image data = 40 + 4096 + 128 = 4264
  dirEntry.writeUInt32LE(22, 12);  // Offset of image data = 22

  const dbHeader = Buffer.alloc(40);
  dbHeader.writeUInt32LE(40, 0);    // Header size = 40
  dbHeader.writeInt32LE(32, 4);     // Width = 32
  dbHeader.writeInt32LE(64, 8);     // Height = 64 (2 * 32)
  dbHeader.writeUInt16LE(1, 12);    // Planes = 1
  dbHeader.writeUInt16LE(32, 14);   // Bits per pixel = 32
  dbHeader.writeUInt32LE(0, 16);    // Compression = BI_RGB (0)
  dbHeader.writeUInt32LE(4096, 20); // Image size = 4096
  dbHeader.writeInt32LE(0, 24);     // X pixels per meter = 0
  dbHeader.writeInt32LE(0, 28);     // Y pixels per meter = 0
  dbHeader.writeUInt32LE(0, 32);    // Colors used = 0
  dbHeader.writeUInt32LE(0, 36);    // Colors important = 0

  const pixelData = Buffer.alloc(4096);
  
  // Custom glowing signal algorithm
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * 32 + x) * 4;
      
      // Distance from center (15.5, 15.5)
      const dx = x - 15.5;
      const dy = y - 15.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= 4.5) {
        // Core glowing signal cyan/blue center (BGRA: blue=255, green=200, red=0, alpha=255)
        pixelData[idx + 0] = 255; // Blue
        pixelData[idx + 1] = 200; // Green
        pixelData[idx + 2] = 0;   // Red
        pixelData[idx + 3] = 255; // Alpha
      } else if (dist <= 8.5) {
        // Outer soft cyan/signal glow transition
        const progress = (dist - 4.5) / 4;
        const alpha = Math.max(0, Math.round(255 * (1 - progress)));
        pixelData[idx + 0] = 255;
        pixelData[idx + 1] = 160 + Math.round(40 * (1 - progress));
        pixelData[idx + 2] = Math.round(50 * (1 - progress));
        pixelData[idx + 3] = alpha;
      } else if (dist >= 11 && dist <= 13) {
        // Subtle decorative transmission signal wave arcs
        const angle = Math.atan2(dy, dx);
        const isArc = Math.abs(angle) < 0.45 || Math.abs(angle - Math.PI) < 0.45 || Math.abs(angle + Math.PI) < 0.45;
        if (isArc) {
          pixelData[idx + 0] = 255; // Blue
          pixelData[idx + 1] = 150; // Green
          pixelData[idx + 2] = 0;   // Red
          pixelData[idx + 3] = 180; // Alpha
        } else {
          pixelData[idx + 0] = 0;
          pixelData[idx + 1] = 0;
          pixelData[idx + 2] = 0;
          pixelData[idx + 3] = 0;
        }
      } else {
        // Transparent background
        pixelData[idx + 0] = 0;
        pixelData[idx + 1] = 0;
        pixelData[idx + 2] = 0;
        pixelData[idx + 3] = 0;
      }
    }
  }

  // AND mask: 32x32 pixels = 1024 bits = 128 bytes of 0 (fully solid/handled by alpha)
  const andMask = Buffer.alloc(128, 0);

  const fileBuffer = Buffer.concat([header, dirEntry, dbHeader, pixelData, andMask]);
  fs.writeFileSync(faviconPath, fileBuffer);
  console.log("Successfully generated high-contrast glowing 32x32 favicon.ico at", faviconPath);
}
