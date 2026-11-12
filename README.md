# 3D Model Finder

A single HTML page that searches several 3D model libraries at once and ranks the results by a quality score.

**Live:** https://maximilianpufahl2009-sketch.github.io/model-finder/

Or open `index.html` in a browser. It needs no build step and no API key. Blendkit results come through a small Cloudflare Worker (see below); everything else is called straight from the browser.

## What it searches

| Source | What you get | Price info | License info |
|---|---|---|---|
| Sketchfab, downloadable models | Free models with Creative Commons licenses | Free | CC0, BY, BY-SA, BY-ND, BY-NC, … |
| Sketchfab Store, Standard license | Paid models | Exact price, loaded per card | Commercial use allowed |
| Sketchfab Store, Editorial license | Paid models | Exact price, loaded per card | News/editorial use only |
| Blendkit (formerly BlenderKit) | Free and paid models, rated 1–10 by reviewers, GLB and Godot GLB downloads | Free (account) or Full Plan subscription | CC0 or Royalty Free |
| Poly Haven | Free, professionally made models | Free | CC0 |

Fab, CGTrader, TurboSquid, Printables, Thingiverse and Free3D have no open search API, so the page only links to their own search for your term.

## Filters

- **Price:** all, free, paid
- **Commercial use:** any, allowed, not allowed
- **No credit required:** CC0 and store licenses only
- **Can share modified versions:** hides NoDerivs licenses
- **Polygon budget:** any, low-poly (≤ 5k), ≤ 20k, ≤ 50k, ≤ 100k triangles
- **Animated** and **Rigged**, for characters and creatures
- **Sort:** quality score, popularity, newest, relevance, fewest polygons

Each card also lists the download formats (GLB, glTF, USDZ, the original upload).

The query and filters are saved in the URL, so you can bookmark or share a search.

## Quality score (0–100)

| Part | Max | Sketchfab | Poly Haven |
|---|---|---|---|
| Popularity | 40 | Likes, log scale (5,000 likes = full marks) | Downloads, log scale (100,000 = full marks) |
| Like rate | 15 | Likes ÷ views (5% = full marks) | No data, neutral 10 |
| Curated | 20 | Staff Pick | Always (curated library) |
| Craft | 25 | Texture resolution, texture count, description | Texture resolution, full PBR set, description |

Blendkit: popularity from bookmarks (1,000 = full marks), the reviewers' 1–10 quality rating in place of like rate (counted fully from 3 ratings), 10 of 20 curated points because every upload is moderated, and the same craft checks.

This is a heuristic built on public signals. It can't judge topology, UVs or real-world scale. Use the 3D preview before you buy, and check the license on the model page before commercial use.

## Blendkit proxy

Blendkit's search API doesn't allow requests from other websites, so the page calls a Cloudflare Worker that forwards the search and trims the answer. The code is in `proxy/worker.js`. To deploy or update it: Cloudflare dashboard → Workers & Pages → the worker → **Edit code** → replace everything with that file → **Deploy**. The worker's address is set in `index.html` as `PROXY`.

The worker caches each search for an hour, so repeated searches don't hit Blendkit again.

**Royalty Free license in games:** Blendkit's terms allow these models in games, but the model must be packed so players can't open or extract it (for example inside Godot's `.pck` or a Unity/Unreal build), and the game must not let players export it. You can't resell the model itself, even modified.
