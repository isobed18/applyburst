# ApplyBurst

**Find jobs fast, search beyond titles, prepare applications, and measure verified completion.**

CPU-only replacement architecture for [linkedin_job_scraper](https://github.com/isobed18/linkedin_job_scraper). No n8n, GPU, model download, or LLM API key. The website demonstrates the whole discovery → search → preparation → sandbox submission → receipt pipeline.

**Demo:** https://applyburst.decentbard5.chatgpt.site (owner-private research preview).

## What you can try

- Search full descriptions with Boolean expressions, phrases, aliases, and fields. Example: `skill:python AND (backend OR "distributed systems") NOT level:senior`.
- Filter location, workplace, seniority, technology mentions, employment type, known annual USD salary, and observation age. Inspect the source evidence for a match.
- Select 50 unique opportunities, inspect a live Greenhouse question schema, and download a synthetic email draft.
- Run 50 actual multipart requests against the hosted **sandbox**. Uploads are hashed, six synthetic answers are checked, receipts are persisted in D1, and the receiver is independently read again.
- See local browser timing, data completeness, partial source failures, and limits in System lab. Refresh the public feeds without crawling during each query.

**Real employer submission adapters: zero.** No recruiter email or employer application was sent. Fast sandbox execution does not establish that 50 arbitrary employer applications can be completed in seconds. Required facts, authentication, conditional questions, rate limits, and receipt recognition still need verified adapters.

## Measurements, 16 October 2026

| Experiment | Result | Boundary |
| --- | --- | --- |
| Full-description catalog | 1,892 postings / 1,850 unique opportunities | Nine employer boards; 1,891 descriptions; failed-board cache retained |
| Detailed CPU queries | 0.09–3.45ms p95 across ten queries | 30 samples/query, Node process on desktop; excludes transfer and startup |
| Prebuilt index initialization | 11.66ms in the search benchmark | Additional index heap 17.5MB; whole Node heap 79MB |
| Hosted HTTPS sandbox batch | 50/50 persisted in 5.86s | Node desktop client; five concurrent uploads; includes final D1 reread |
| Browser batch, local receiver | 50/50 persisted in 0.94s | Actual resume bytes and receipt reread; synthetic data, five concurrent requests |
| Local known-form browser baseline | 50 fixtures in 8.09s after startup | Two browser contexts; median of three runs; injected receiver delay |

These are desktop measurements, not RTX 3050 laptop results. The site reports the timing measured on the device that opens it. Catalog plus index are about 4.13MB gzip in local compression measurements; actual transfer and browser memory depend on deployment/device. See [benchmarks and raw evidence](docs/BENCHMARKS.md), including slower and partial discovery runs.

## Run the Python discovery core

Python 3.12+ and [uv](https://docs.astral.sh/uv/):

```powershell
uv sync --locked
uv run python -m applyburst.cli refresh
uv run python -m applyburst.cli search engineer --scope all --limit 50
uv run python -m applyburst.cli stats
uv run python -m applyburst.api --port 8765
```

The CLI/API remain the simple SQLite baseline; the website's richer field/Boolean grammar lives in the shared JavaScript search engine. Open http://127.0.0.1:8765/docs for the Python API. Its application capability remains `discovery_only`.

Use `refresh --preset turkey` for the four Turkish employer boards. `--max-age 3600` excludes observations older than an hour. Data lives in ignored `.data/catalog.sqlite`. Failed boards retain their previous postings and observation ages. The [registry](config/boards.json) is a small verified seed, not a market-wide catalog.

## Run the website

The full source is in [demo/](demo/README.md), using Node 22.13+, React/Vinext, Cloudflare Workers, D1, and R2. The bundled data works before a live refresh. See its README for installation, the local schema migration, and startup.

```powershell
cd demo
npm ci
npm test
npm run build
# Apply the documented D1 migration once to a fresh local database.
npm run dev -- --port 5175
```

Regenerate the shared snapshot from the repository root, then rebuild the packed index:

```powershell
uv run python -m applyburst.export_catalog --output demo/public/jobs.json
cd demo
node scripts/build-search-index.mjs
node scripts/benchmark-search.mjs
```

Only public job data belongs in the snapshot. Detailed search uses a revision-checked prebuilt inverted index in a Web Worker. A changed catalog safely rebuilds its index on the CPU. At market-wide scale, serve retrieval from a shared service instead of downloading the entire index.

## Reproduce the baseline

```powershell
uv sync --locked --extra bench
uv run --extra bench python -m pytest -q
uv run --extra bench python -m applyburst.discovery_bench --output artifacts/discovery.json
uv run --extra bench python -m applyburst.api_bench --output artifacts/search-http.json
uv run --extra bench python -m applyburst.bench --live --repeats 3 --output artifacts/baseline.json
```

The HTTP search benchmark needs a populated catalog. Discovery benchmarking uses its own empty in-memory index. Add `--browser` after installing Playwright Chromium to measure local known-form replay. Use a local browser-cache path; on this machine it is `D:\cache\ms-playwright`. The optional `scraper` extra enables `python -m applyburst.scraper_probe`; the bounded LinkedIn probe returned 20/50 requested jobs in 14.3s with a 429 warning. It is outside the interactive path.

## Design and evidence

- [Architecture](docs/ARCHITECTURE.md): components, contracts, caching, search, preparation, execution, confirmation, and scaling.
- [Primary-source review](docs/RESEARCH.md): ATS feeds, public systems, browser-agent literature, Jev, and lightweight classifiers.
- [Measurements](docs/BENCHMARKS.md): precise timing boundaries and preserved raw reports.
- [Roadmap](docs/ROADMAP.md): remaining coverage, real-adapter, quality, and laptop gates.
- [AGENTS.md](AGENTS.md): **no subagents**, **no n8n**, **CPU first**, and no unreviewed real submissions.

Source is MIT-licensed. Model benchmarks remain deferred; there is no unverified claim that a classifier is better than Jev.
