# 3D Model Finder

A single HTML page that searches several 3D model libraries at once and ranks the results by a quality score.

**Live:** https://maximilianpufahl2009-sketch.github.io/model-finder/

Or open `index.html` in a browser. It needs no server, no build step and no API key.

## What it searches

| Source | What you get | Price info | License info |
|---|---|---|---|
| Sketchfab, downloadable models | Free models with Creative Commons licenses | Free | CC0, BY, BY-SA, BY-ND, BY-NC, … |
| Sketchfab Store, Standard license | Paid models | Exact price, loaded per card | Commercial use allowed |
| Sketchfab Store, Editorial license | Paid models | Exact price, loaded per card | News/editorial use only |
| Poly Haven | Free, professionally made models | Free | CC0 |

Fab, CGTrader, TurboSquid, Printables, Thingiverse and Free3D have no open search API, so the page only links to their own search for your term.

## Filters

- **Price:** all, free, paid
- **Commercial use:** any, allowed, not allowed
- **No credit required:** CC0 and store licenses only
- **Can share modified versions:** hides NoDerivs licenses
- **Sort:** quality score, popularity, newest, relevance

The query and filters are saved in the URL, so you can bookmark or share a search.

## Quality score (0–100)

| Part | Max | Sketchfab | Poly Haven |
|---|---|---|---|
| Popularity | 40 | Likes, log scale (5,000 likes = full marks) | Downloads, log scale (100,000 = full marks) |
| Like rate | 15 | Likes ÷ views (5% = full marks) | No data, neutral 10 |
| Curated | 20 | Staff Pick | Always (curated library) |
| Craft | 25 | Texture resolution, texture count, description | Texture resolution, full PBR set, description |

This is a heuristic built on public signals. It can't judge topology, UVs or real-world scale. Use the 3D preview before you buy, and check the license on the model page before commercial use.
