interface MixData {
  id: string;
  name: string;
  lyrics: Record<string, string>;
  voice: { name: string; speed: number; pitch: number };
  birds: { selected: string[]; volumes: number[]; timing: string };
  soundscape: Record<string, unknown>;
  vibe: string;
  rainVolume: number;
  oceanVolume: number;
  vinylVolume: number;
  activeBpm: number;
  createdAt: number;
}

const mixStore = new Map<string, MixData>();

function generateMixId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (req: Request) => Promise<Response> } }): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === "/api/mix/save" && method === "POST") {
      try {
        const body = await request.json() as Record<string, unknown>;
        const id = generateMixId();
        const mix: MixData = {
          id,
          name: (body.name as string) || "Untitled Mix",
          lyrics: (body.lyrics as Record<string, string>) || { title: "", verse1: "", chorus: "", verse2: "", bridge: "", outro: "" },
          voice: (body.voice as { name: string; speed: number; pitch: number }) || { name: "", speed: 1.0, pitch: 1.0 },
          birds: (body.birds as { selected: string[]; volumes: number[]; timing: string }) || { selected: [], volumes: [], timing: "between-verses" },
          soundscape: (body.soundscape as Record<string, unknown>) || {},
          vibe: (body.vibe as string) || "dreamy",
          rainVolume: (body.rainVolume as number) ?? 0,
          oceanVolume: (body.oceanVolume as number) ?? 0,
          vinylVolume: (body.vinylVolume as number) ?? 0,
          activeBpm: (body.activeBpm as number) ?? 70,
          createdAt: Date.now(),
        };
        mixStore.set(id, mix);
        return jsonResponse({ success: true, id, url: `/mix/${id}` });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save mix";
        return jsonResponse({ error: msg }, 500);
      }
    }

    if (path === "/api/mix/list" && method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
      const mixes = Array.from(mixStore.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
        .map(({ id, name, voice, birds, vibe, createdAt }) => ({ id, name, voice: voice?.name || "", birds: birds?.selected?.length || 0, vibe, createdAt }));
      return jsonResponse({ mixes, total: mixStore.size });
    }

    if (path.startsWith("/api/mix/load/") && method === "GET") {
      const id = path.replace("/api/mix/load/", "");
      const mix = mixStore.get(id);
      if (!mix) {
        return jsonResponse({ error: "Mix not found" }, 404);
      }
      return jsonResponse(mix);
    }

    if (path === "/api/health") {
      return jsonResponse({ status: "alive", time: new Date().toISOString() });
    }

    return env.ASSETS.fetch(request);
  },
};
