import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { SEO_PAGES, generateFAQSchema, getDynamicPageData } from "./src/seoData";
import { BIRD_PRESETS } from "./src/lib/birdPresets";
import { BLOG_POSTS } from "./src/blogData";

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

// Serve Google Site Verification file explicitly
app.get("/google14833afe332cbfc4.html", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send("google-site-verification: google14833afe332cbfc4.html");
});

// Serve Bing Site Verification file explicitly
app.get("/BingSiteAuth.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.sendFile(path.join(process.cwd(), "public", "BingSiteAuth.xml"));
});

// Serve IndexNow verification key file explicitly
app.get("/3c1fb8dc9e5046e3abf45366cdef57d0.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(path.join(process.cwd(), "public", "3c1fb8dc9e5046e3abf45366cdef57d0.txt"));
});

// Helper to generate and automatically update sitemap.xml on disk
export function generateAndSaveSitemap(customBaseUrl?: string) {
  const combos = [
    "/ocean-waves-and-rain",
    "/ocean-waves-and-crickets",
    "/ocean-waves-and-owl-sounds",
    "/songbirds-and-forest-breeze",
    "/rain-and-vinyl-crackles",
    "/neon-lofi-and-ocean-sounds"
  ];
  
  const baseUrl = customBaseUrl || process.env.SITEMAP_BASE_URL || "https://midnightsignals.ajimp340.workers.dev"; // Default to verified Search Console domain

  // Helper to extract actual modified dates of source files
  const getFileModDate = (relativeFilePath: string): string => {
    try {
      const fullPath = path.join(process.cwd(), relativeFilePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return stats.mtime.toISOString().split("T")[0];
      }
    } catch (e) {
      console.warn(`Could not fetch stats for ${relativeFilePath}`);
    }
    return new Date().toISOString().split("T")[0];
  };

  const homepageMod = getFileModDate("src/App.tsx");
  const seoDataMod = getFileModDate("src/seoData.ts");
  const infographicMod = getFileModDate("src/components/EmbeddableInfographic.tsx");
  const serverMod = getFileModDate("server.ts");
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${homepageMod}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Interactive Science Infographic Page (Linkable Asset)
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/science-of-lofi-focus-infographic</loc>\n`;
  xml += `    <lastmod>${infographicMod}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `  </url>\n`;
  
  // 3. SEO Pages
  for (const page of SEO_PAGES) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${seoDataMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3b. Programmatic Bird Pages
  for (const bird of BIRD_PRESETS) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/birds/${bird.id}</loc>\n`;
    xml += `    <lastmod>${seoDataMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3c. Programmatic Lofi Sound/Mood combinations
  const sounds = ["rain", "ocean", "birds", "crickets", "thunderstorm", "vinyl", "coffeeshop"];
  const moods = ["study", "sleep", "focus", "relax", "meditation", "chill"];

  for (const sound of sounds) {
    // Sound main page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/lofi/${sound}</loc>\n`;
    xml += `    <lastmod>${seoDataMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;

    // Sound + Mood combinations
    for (const mood of moods) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/lofi/${sound}/${mood}</loc>\n`;
      xml += `    <lastmod>${seoDataMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // 3d. Localized Target Pages
  const localizedPaths = [
    // German
    "/de/lernen-mit-lofi",
    "/de/regengerausche-schlafen",
    "/de/vogelstimmen",
    "/de/indische-naturgerausche",
    // French
    "/fr/pluie-pour-dormir",
    "/fr/oiseaux-chantent",
    "/fr/lofi-etudier",
    // Swiss
    "/ch/alpengerausche",
    "/ch/kuhglocken",
    "/ch/natur-ambient",
    // Hindi (India Expansion)
    "/hi/barsat-ki-awaz-sona",
    "/hi/dhyan-mandir-ghanti",
    // Dutch (Netherlands)
    "/nl/merel-vogelgeluid",
    "/nl/koolmees-geluid",
    "/nl/nederlandse-tuinvogels",
    "/nl/regen-lofi-studeren",
    "/nl/vogelgeluiden-lofi"
  ];

  for (const path of localizedPaths) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${seoDataMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }
  
  // 4. Custom Combo Presets
  for (const comboPath of combos) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${comboPath}</loc>\n`;
    xml += `    <lastmod>${serverMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // 5. Blog Article Pages
  const blogDataMod = getFileModDate("src/blogData.ts");
  for (const post of BLOG_POSTS) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${blogDataMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }
  // Blog index page
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/blog</loc>\n`;
  xml += `    <lastmod>${blogDataMod}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.85</priority>\n`;
  xml += `  </url>\n`;
  
  xml += `</urlset>`;

  try {
    // Write to root sitemap.xml
    fs.writeFileSync(path.join(process.cwd(), "sitemap.xml"), xml, "utf8");
    
    // Write to public/sitemap.xml
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
    
    // Write to dist/sitemap.xml if the dist folder already exists
    const distDir = path.join(process.cwd(), "dist");
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
    }
  } catch (err) {
    console.error("[Midnight Signals] Failed to write sitemap.xml:", err);
  }

  return xml;
}

// Serve sitemap.xml for Google/Bing crawler bot indexing
app.get(["/sitemap.xml", "/api/sitemap.xml"], (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  
  const protoHeader = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || req.protocol || "https";
  const host = req.headers.host || "midnight-signals.cloud";
  const currentBaseUrl = `${protocol}://${host}`;
  
  const xml = generateAndSaveSitemap(currentBaseUrl);
  res.send(xml);
});

// Serve robots.txt for search indexing configurations
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const robotsPath = path.join(process.cwd(), "public", "robots.txt");
  fs.readFile(robotsPath, "utf8", (err, content) => {
    if (err) {
      return res.sendFile(robotsPath);
    }
    const host = req.headers.host || "midnight-signals.cloud";
    const modifiedContent = content.replace(/midnightsignals\.ajimp340\.workers\.dev/g, host);
    res.send(modifiedContent);
  });
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

// In-memory mix store (swap with Cloudflare KV for production)
const mixStore = new Map<string, any>();

function generateMixId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Save a mix snapshot
app.post("/api/mix/save", (req, res) => {
  try {
    const { name, lyrics, voice, birds, soundscape, vibe, rainVolume, oceanVolume, vinylVolume, activeBpm } = req.body;
    const id = generateMixId();
    const mix = {
      id,
      name: name || "Untitled Mix",
      lyrics: lyrics || { title: "", verse1: "", chorus: "", verse2: "", bridge: "", outro: "" },
      voice: voice || { type: "ravi", speed: 1.0, pitch: 1.0 },
      birds: birds || { selected: [], volumes: [], timing: "between-verses" },
      soundscape: soundscape || { rain: 0, ocean: 0, wind: 0, brook: 0, lofi: { style: "dreamy", bpm: 70 }, binaural: "none" },
      vibe: vibe || "dreamy",
      rainVolume: rainVolume ?? 0,
      oceanVolume: oceanVolume ?? 0,
      vinylVolume: vinylVolume ?? 0,
      activeBpm: activeBpm ?? 70,
      createdAt: Date.now(),
    };
    mixStore.set(id, mix);
    console.log(`[Mix] Saved mix ${id}: "${mix.name}"`);
    res.json({ success: true, id, url: `/mix/${id}` });
  } catch (err: any) {
    console.error("[Mix] Save error:", err);
    res.status(500).json({ error: err.message || "Failed to save mix" });
  }
});

// Load a saved mix
app.get("/api/mix/load/:id", (req, res) => {
  const mix = mixStore.get(req.params.id);
  if (!mix) {
    return res.status(404).json({ error: "Mix not found" });
  }
  res.json(mix);
});

async function startServer() {
  // Automatically generate and write sitemap.xml on startup
  try {
    generateAndSaveSitemap();
  } catch (sitemapErr) {
    console.error("Startup sitemap generation error:", sitemapErr);
  }

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

      const indexPath = path.join(distPath, "index.html");
      fs.readFile(indexPath, "utf8", (err, html) => {
        if (err) {
          console.error("Error reading production index.html:", err);
          return res.status(404).send("Not Found");
        }

        const currentPath = req.path === "/" ? "" : req.path;
        
        const protoHeader = req.headers["x-forwarded-proto"];
        const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || req.protocol || "https";
        const host = req.headers.host || "midnight-signals.cloud";
        
        // Match current route to dynamic SEO data
        let title = "Midnight Signals | Lofi Radio, Sleep Sound & Nature Mixer";
        let metaDescription = "Create custom lofi radio stations with ocean waves, bird songs, rain ambience, AI lyrics and sleep-friendly soundscapes. Free online ambient sound generator.";
        let keywords = ["Midnight Signals", "lo-fi music", "AI poetry", "lyric transmission", "chill starlight synthesizer", "relax sound hub", "ambient noise player"];
        
        let activePage = SEO_PAGES.find((p) => p.path === currentPath) || getDynamicPageData(currentPath);
        let isMatched = !!activePage;

        if (!activePage && currentPath === "/science-of-lofi-focus-infographic") {
          activePage = {
            path: "/science-of-lofi-focus-infographic",
            title: "Science of Lo-Fi & Focus | Scientific Infographic",
            metaDescription: "Learn how lofi rhythms, pink noise, and organic auditory features induce deep focus, attention restoration, and alleviate stress. Interactive science infographic.",
            keywords: ["science of lofi", "lofi acoustic focus", "attention restoration theory", "binaural beats science", "nature sound therapy"],
            headline: "The Science of Lo-Fi & Focus",
            subheading: "An interactive, web-synthesized exploration of alpha brainwaves, pink noise maskers, and cognitive restoration cycles.",
            accentColor: "from-amber-500 to-orange-400",
            vibe: "dreamy",
            introText: "",
            sections: [],
            faqs: [
              {
                question: "Can I embed this infographic for free?",
                answer: "Yes! There are no hidden fees or paywalls. Simply copy the iframe code block and drop it directly onto any HTML or WordPress site to share this interactive asset."
              },
              {
                question: "How does the brainwave simulator correspond to actual sound?",
                answer: "The simulated frequencies in the infographic match actual physical brain frequencies. Midnight Signals’ built-in Binaural focus node lets you apply a real 6Hz (Theta) offset to help your ears adapt to deep concentration states organically."
              }
            ],
            presetConfig: {
              activeChannels: { birds: true, owl: false, trees: true, ocean: true, crickets: true },
              channelVolumes: { birds: 0.2, owl: 0.0, trees: 0.4, ocean: 0.3, crickets: 0.2 },
              customLyrics: "",
              customTitle: "",
              customArtist: "",
              bpm: 72,
              synthWaveform: "triangle"
            }
          };
        }

        if (!activePage && currentPath === "/embed/science-of-lofi") {
          title = "Science of Lo-Fi Interactive Embed Frame | Midnight Signals";
          metaDescription = "Interactive widget showing lofi acoustic curves, cognitive rest patterns, and brain wave bands.";
          isMatched = true;
        }

        if (!activePage && currentPath === "/create/lyrics") {
          title = "Create Your Lyric | Write Your Own Lofi Song | Midnight Signals";
          metaDescription = "Write your own lofi lyrics — title, verses, chorus, bridge and outro. Save drafts and preview in the Midnight Signals mixer.";
          isMatched = true;
        }

        if (!activePage && currentPath.startsWith("/mix/")) {
          title = "Listen to a Saved Lofi Mix | Midnight Signals";
          metaDescription = "A custom lofi mix shared from Midnight Signals. Listen to the saved soundscape, voice, and lyrics.";
          isMatched = true;
        }
        
        if (activePage) {
          isMatched = true;
          title = activePage.title;
          metaDescription = activePage.metaDescription;
          keywords = activePage.keywords;
        } else {
          // Check combo pages
          const combos = [
            { path: "/ocean-waves-and-rain", headline: "Ocean Waves & Soft Rain" },
            { path: "/ocean-waves-and-crickets", headline: "Waves & Field Crickets" },
            { path: "/ocean-waves-and-owl-sounds", headline: "Waves & Woodland Owls" },
            { path: "/songbirds-and-forest-breeze", headline: "Songbirds & Forest Breeze" },
            { path: "/rain-and-vinyl-crackles", headline: "Soft Rain & Cozy Vinyl" },
            { path: "/neon-lofi-and-ocean-sounds", headline: "Neon Lo-Fi & Ocean Surf" }
          ];
          const matchedCombo = combos.find((c) => c.path === currentPath);
          if (matchedCombo) {
            title = `${matchedCombo.headline} | Custom Lofi Radio Mixer & Nature Sounds`;
            metaDescription = `Play our automatic relaxation preset blending ${matchedCombo.headline.toLowerCase()} with generative synths. Clean browser-synthesized focus audio.`;
            isMatched = true;
          }
        }

        // Check blog pages
        if (!isMatched && (currentPath === "/blog" || currentPath.startsWith("/blog/"))) {
          isMatched = true;
          if (currentPath === "/blog") {
            title = "Midnight Journal | Research & Guides on Ambient Sound Science";
            metaDescription = "Explore in-depth articles on neuro-acoustics, rain sounds for sleep, birdsong therapy, lofi focus science, and procedural nature sound generation.";
            keywords = ["ambient sound blog", "lofi science articles", "rain sleep guide", "nature sound research", "neuro-acoustic journal"];
          } else {
            // Individual blog post
            const blogSlug = currentPath.replace("/blog/", "");
            const blogPost = BLOG_POSTS.find((p: any) => p.slug === blogSlug);
            if (blogPost) {
              title = blogPost.title;
              metaDescription = blogPost.metaDescription;
              keywords = blogPost.keywords;
            } else {
              isMatched = false; // slug not found, let 404 handle it
            }
          }
        }

        if (currentPath !== "" && !isMatched) {
          res.status(404);
        }

        const canonicalUrl = `${protocol}://${host}${activePage ? activePage.path : currentPath}`;

        // Dynamic element substitutions
        let modifiedHtml = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        modifiedHtml = modifiedHtml.replace(/(<meta\s+name=["']description["']\s+content=")[^"]*(")/i, `$1${metaDescription}$2`);
        modifiedHtml = modifiedHtml.replace(/(<meta\s+name=["']keywords["']\s+content=")[^"]*(")/i, `$1${keywords.join(", ")}$2`);
        modifiedHtml = modifiedHtml.replace(/(<link\s+rel=["']canonical["']\s+href=")[^"]*(")/i, `$1${canonicalUrl}$2`);

        // Inject page-specific Google Structured Data (Schema.org JSON-LD)
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": title,
          "description": metaDescription,
          "url": canonicalUrl,
          "isPartOf": {
            "@type": "WebSite",
            "name": "Midnight Signals",
            "url": `${protocol}://${host}/`
          },
          "publisher": {
            "@type": "Organization",
            "name": "Midnight Signals",
            "logo": {
              "@type": "ImageObject",
              "url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=128&h=128&q=80"
            }
          }
        };

        let jsonLdInjected = `\n    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;

        // If the active SEO page has FAQs, we inject additional FAQPage schema!
        if (activePage) {
          const faqSchema = generateFAQSchema(activePage);
          if (faqSchema) {
            jsonLdInjected += `\n    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
          }
        }

        // If this is a blog article, inject BlogPosting schema
        if (currentPath.startsWith("/blog/")) {
          const blogSlug = currentPath.replace("/blog/", "");
          const blogPost = BLOG_POSTS.find((p: any) => p.slug === blogSlug);
          if (blogPost) {
            const blogSchema = {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": blogPost.headline,
              "description": blogPost.metaDescription,
              "datePublished": blogPost.publishedDate,
              "dateModified": blogPost.updatedDate,
              "author": {
                "@type": "Person",
                "name": blogPost.author.name,
                "description": blogPost.author.bio
              },
              "publisher": {
                "@type": "Organization",
                "name": "Midnight Signals"
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
              },
              "image": blogPost.coverImage
            };
            jsonLdInjected += `\n    <script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`;

            // Also inject FAQPage schema if the blog post has FAQs
            if (blogPost.faqs && blogPost.faqs.length > 0) {
              const blogFaqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": blogPost.faqs.map((f: any) => ({
                  "@type": "Question",
                  "name": f.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.answer
                  }
                }))
              };
              jsonLdInjected += `\n    <script type="application/ld+json">${JSON.stringify(blogFaqSchema)}</script>`;
            }
          }
        }

        jsonLdInjected += `\n  </head>`;
        modifiedHtml = modifiedHtml.replace(/<\/head>/i, jsonLdInjected);

        res.setHeader("Content-Type", "text/html");
        res.send(modifiedHtml);
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Midnight Signals] Fullstack server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
