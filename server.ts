import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { SEO_PAGES } from "./src/seoData";

const app = express();
const PORT = 3000;

app.use(express.json());

// Redirect HTTP to HTTPS in production behind reverse proxies like Cloudflare/Google Cloud Run
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, `https://${req.headers.host || "midnight-signals.cloud"}${req.url}`);
  }
  next();
});

// Lazy register GoogleGenAI
let ai: GoogleGenAI | null = null;
const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for signals.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
};

// Healthy probe
app.get("/api/health", (req, res) => {
  res.json({ status: "alive", time: new Date().toISOString() });
});

// Serve ads.txt for AdSense crawler verification
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(path.join(process.cwd(), "public", "ads.txt"));
});

// Serve sitemap.xml for Google/Bing crawler bot indexing
app.get(["/sitemap.xml", "/api/sitemap.xml"], (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  
  const combos = [
    "/ocean-waves-and-rain",
    "/ocean-waves-and-crickets",
    "/ocean-waves-and-owl-sounds",
    "/songbirds-and-forest-breeze",
    "/rain-and-vinyl-crackles",
    "/neon-lofi-and-ocean-sounds"
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
  res.send(xml);
});

// Serve robots.txt for search indexing configurations
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
});

// Serve site.webmanifest
app.get("/site.webmanifest", (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json");
  res.sendFile(path.join(process.cwd(), "public", "site.webmanifest"));
});

// Serve favicon.svg
app.get("/favicon.svg", (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  res.sendFile(path.join(process.cwd(), "public", "favicon.svg"));
});

// Serve favicon.ico
app.get("/favicon.ico", (req, res) => {
  res.setHeader("Content-Type", "image/x-icon");
  res.sendFile(path.join(process.cwd(), "public", "favicon.ico"));
});

// Serve apple-touch-icon.png
app.get("/apple-touch-icon.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(process.cwd(), "public", "apple-touch-icon.png"));
});

// Serve icon-192.png
app.get("/icon-192.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(process.cwd(), "public", "icon-192.png"));
});

// Serve icon-512.png
app.get("/icon-512.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(process.cwd(), "public", "icon-512.png"));
});

// Post an unsent late-night message to get an AI "Echo from the other star"
app.post("/api/echo", async (req, res) => {
  try {
    const { message, vibe = "thoughtful" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a non-empty string." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Graceful local fallbacks if API key is not set
      const defaultEchoes: Record<string, { reply: string; verse: string }> = {
        dreamy: {
          reply: "Your signal floats through the quiet ether. Far away, another soul traces the same starlight path, holding a coffee cup, listening to the static hum of midnight skies.",
          verse: "We write our secrets on the misty breeze,\nHanging our wishes on the sleeping trees,\nThough static breaks and lines are far apart,\nYou're still the beacon pulsing in my heart."
        },
        melancholy: {
          reply: "A quiet shadow falls. Some thoughts are meant to linger as quiet signals, traveling without an answer through neon-lit streets that never quite dry.",
          verse: "Unread letters stacked beside the bed,\nSo many sentences we left unsaid,\nThe highway curves into a wider view,\nBut every signpost points me back to you."
        },
        hopeful: {
          reply: "The dark city light is beautiful, but starlight is brighter. Your frequency is drifting outwards, finding its resonance in the vast, warm universe.",
          verse: "The dark will fade and morning lights will rise,\nTo dry the rain that gathered in your eyes,\nUntil the stars decide to guide me home,\nI'll send these signals through the deep unknown."
        }
      };

      const selected = defaultEchoes[vibe as keyof typeof defaultEchoes] || defaultEchoes.dreamy;
      return res.json({
        success: true,
        reply: selected.reply,
        verse: selected.verse,
        isDemo: true,
        tip: "Set your own GEMINI_API_KEY in Settings > Secrets to activate real-time AI receivers."
      });
    }

    const client = getAIClient();
    const systemPrompt = `You are 'The Midnight Echo' receiver. The user has sent an 'unsent late-night signal' message, reflecting their quiet thoughts, unspoken words, or memories in the dark city night.
Your task is to listen deeply and respond on the same frequency in the style of the song 'Midnight Signals' (city haze, neon dreams, lost stars, heartbeats calling, rain, streetlights painting silver).
Write a response structured as JSON with two fields:
1. 'reply': A short, comforting, poetic reply (about 20-35 words) that acts as a cozy or ethereal response from another 'lost star' who heard their message.
2. 'verse': A custom 4-line verse of lyrics (continuing or responding to their theme) using standard lyrical form. Maintain the nostalgic, late-night, beautiful lofi lyric feel.

Return strictly raw JSON format matching this schema:
{
  "reply": "string",
  "verse": "string"
}
Ensure you return nothing but valid JSON. Do not wrap the JSON output in markdown formatting.`;

    const userPrompt = `Message: "${message}"\nCurrent Vibe Filter: ${vibe}`;

    const modelResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const text = modelResponse.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    try {
      const parsed = JSON.parse(text.trim());
      return res.json({
        success: true,
        reply: parsed.reply || "A comforting echo slides silently into your frequency...",
        verse: parsed.verse || "Midnight signals fade...\nWaiting for response...",
        isDemo: false
      });
    } catch (jsonErr) {
      console.error("JSON parsing error on Gemini output:", text, jsonErr);
      return res.json({
        success: true,
        reply: text.trim(),
        verse: "Late night reflections\nCarried on the breeze\nUntil we meet again\nAmong the glowing dreams.",
        isDemo: false
      });
    }

  } catch (err: any) {
    console.error("Echo endpoint error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong in the starry system.",
    });
  }
});

async function startServer() {
  // Integrate Vite for hot module replacement and client rendering
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files with custom headers for CDN caching optimization
    app.use(express.static(distPath, {
      maxAge: "30d", // Base browser caching max age
      setHeaders: (res, filePath) => {
        // Apply immutable, long-lived headers for static assets containing Vite hashes
        if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|webp)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          // Keep index.html fresh at all times
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      }
    }));

    app.get("*", (req, res) => {
      // If a dynamic asset/file with an extension is requested but wasn't served by express.static,
      // return a true 404 rather than fall back to index.html (which causes Console Parsing Errors)
      const ext = path.extname(req.path);
      if (ext && ext !== ".html") {
        return res.status(404).send("Not Found");
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Midnight Signals] Fullstack server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
