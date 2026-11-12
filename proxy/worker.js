// Cloudflare Worker for the 3D Model Finder.
//
// Blendkit (formerly BlenderKit) has an open search API, but its server does not
// allow requests from other websites, so the page cannot call it directly. This
// worker forwards one kind of request (a model search), trims the answer down
// to the fields the page uses, and caches it for an hour to keep load on
// Blendkit low.
//
// Deploy: Cloudflare dashboard -> Workers & Pages -> your worker -> Edit code ->
// replace everything with this file -> Deploy.

const UPSTREAM = "https://www.blendkit.com/api/v1/search/";

// Only these pages may use the worker from a browser. "null" is a page opened
// straight from a file on your computer.
const ALLOWED_ORIGINS = [
  "https://maximilianpufahl2009-sketch.github.io",
  "null",
];

const PAGE_SIZE = 48;
const MAX_PAGE = 10;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
      return json({ ok: true, service: "model-finder proxy", routes: ["/blendkit/search?q=..."] }, 200, cors);
    }
    if (request.method !== "GET" || url.pathname !== "/blendkit/search") {
      return json({ error: "not found" }, 404, cors);
    }

    // ---- Build the Blendkit query from a small, fixed set of options ----
    const q = (url.searchParams.get("q") || "").replace(/[:]/g, " ").trim().slice(0, 100);
    if (!q) return json({ error: "missing q" }, 400, cors);

    const parts = [q, "asset_type:model"];
    const price = url.searchParams.get("price");
    if (price === "free") parts.push("is_free:true");
    if (price === "paid") parts.push("is_free:false");
    const budget = parseInt(url.searchParams.get("budget") || "", 10);
    if (budget > 0) parts.push(`faceCount_lte:${Math.min(budget, 10_000_000)}`);
    if (url.searchParams.get("rigged") === "1") parts.push("rig:true");
    if (url.searchParams.get("animated") === "1") parts.push("animated:true");

    const page = Math.min(Math.max(parseInt(url.searchParams.get("page") || "1", 10) || 1, 1), MAX_PAGE);

    const upstream = new URL(UPSTREAM);
    upstream.searchParams.set("query", parts.join(" "));
    upstream.searchParams.set("page_size", String(PAGE_SIZE));
    upstream.searchParams.set("page", String(page));

    let data;
    try {
      const res = await fetch(upstream, { cf: { cacheTtl: 3600, cacheEverything: true } });
      if (res.status === 404) return json({ count: 0, hasNext: false, results: [] }, 200, cors); // past last page
      if (!res.ok) return json({ error: `Blendkit answered ${res.status}` }, 502, cors);
      data = await res.json();
    } catch (e) {
      return json({ error: "Blendkit unreachable" }, 502, cors);
    }

    const results = (data.results || []).map(slim);
    return json({ count: data.count || 0, hasNext: !!data.next, results }, 200, {
      ...cors,
      "Cache-Control": "public, max-age=600",
    });
  },
};

function slim(r) {
  const p = r.dictParameters || {};
  const types = new Set((r.files || []).map((f) => f.fileType));
  return {
    id: r.id,
    baseId: r.assetBaseId,
    name: r.displayName || r.name || "Untitled",
    author: r.author?.fullName || [r.author?.firstName, r.author?.lastName].filter(Boolean).join(" "),
    isFree: !!r.isFree,
    license: r.license || null, // "royalty_free" | "cc_zero"
    created: r.created || null,
    descLen: (r.description || "").trim().length,
    faces: p.faceCount ?? null,
    animated: !!p.animated,
    rigged: !!p.rig,
    texRes: p.textureResolutionMax ?? null,
    texCount: p.textureCount ?? null,
    pbr: !!p.purePbr,
    qualityAvg: r.ratingsAverage?.quality ?? null,
    qualityCount: r.ratingsCount?.quality ?? 0,
    bookmarks: r.ratingsCount?.bookmarks ?? 0,
    thumb: r.thumbnailMiddleUrl || r.thumbnailSmallUrl || "",
    formats: ["gltf", "gltf_godot", "blend"].filter((t) => types.has(t)),
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}
