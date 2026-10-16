# ApplyBurst

**Find jobs fast. Prepare and execute supported applications without a per-click AI loop.**

CPU-only research baseline for a replacement of [linkedin_job_scraper](https://github.com/isobed18/linkedin_job_scraper). No n8n, GPU, model download or LLM API key is required. The current focus is discovery and a measured execution architecture. Real employer application adapters and the public demo are later milestones.

## Measured on 16 October 2026

- Empty-index discovery: **50 “engineer” title matches in 0.77 seconds**, all **1,890 jobs from nine boards in 5.89 seconds**.
- Cached HTTP search: **12ms median / 33ms p95**, 200 requests returning 50 title matches each from a separate 1,695-job catalog.
- Known-form application fixtures: 50 submissions with validated uploaded bytes and receipts. See the full HTTP/browser/SMTP timings in [benchmarks](docs/BENCHMARKS.md).
- JobSpy LinkedIn probe: **20/50 requested results in 14.3 seconds**, with an observed 429 warning.

These are desktop measurements, not laptop results. Search matches are not proof of personal eligibility. All application writes target loopback fixtures; no employer applications or recruiter emails were sent. SMTP acceptance is reported separately from delivery and ATS submission.

## Run discovery

From the repository root, with Python 3.12+ and [uv](https://docs.astral.sh/uv/):

```powershell
uv sync --locked
uv run python -m applyburst.cli refresh
uv run python -m applyburst.cli search engineer --limit 50
uv run python -m applyburst.cli stats
```

Use `refresh --preset turkey` to fetch the four Turkish employer boards only. Search defaults to title matching; `--scope all` includes location and description text. `--max-age 3600` excludes records not observed successfully within an hour. Jobs are stored in ignored `.data/catalog.sqlite`; a failed refresh does not refresh their age or erase the previous board.

The board registry lives in [config/boards.json](config/boards.json). It is a small seed, not a market-wide catalog. Greenhouse, Lever and Ashby are supported. Public reads use HTTP; no browser starts for discovery.

## Try the discovery API

```powershell
uv run python -m applyburst.api --port 8765
```

Open **http://127.0.0.1:8765/docs** for interactive API documentation. `POST /refresh` starts a public read-only refresh; `GET /jobs?query=engineer&limit=50` searches immediately, including while feeds finish; `GET /status` shows source coverage and refresh status. The service binds to loopback and does not submit applications. Every result's application capability is currently `discovery_only`.

## Reproduce measurements

```powershell
uv sync --locked --extra bench
uv run --extra bench python -m pytest -q
uv run --extra bench python -m applyburst.discovery_bench --output artifacts/discovery.json
uv run --extra bench python -m applyburst.api_bench --output artifacts/search-http.json
```

The HTTP search benchmark needs a populated catalog from `cli refresh`. The discovery benchmark starts its own empty in-memory catalog and does not change an existing user's data.

For actual browser execution against the local receiver on Windows, place browsers on D: on this machine:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'D:\cache\ms-playwright'
uv run --extra bench python -m playwright install chromium
uv run --extra bench python -m applyburst.bench --live --browser --repeats 3 --output artifacts/baseline.json
```

On Linux/macOS, choose a local browser-cache path and use `export PLAYWRIGHT_BROWSERS_PATH=...`. Omit `--browser` to run HTTP and SMTP fixtures only. Repeated runs include a 2-request/second case, so the full benchmark deliberately takes several minutes.

The optional LinkedIn probe installs heavier scraper dependencies and makes a bounded public search:

```powershell
uv run --extra bench --extra scraper python -m applyburst.scraper_probe
```

It stops after 60 seconds, uses no login or proxy, and may return partial data. It is not part of the fast search request path.

## Decisions and next work

- [Architecture](docs/ARCHITECTURE.md): background ingestion → searchable cache → preparation → deterministic execution → verified receipt.
- [Primary-source review](docs/RESEARCH.md): ATS feeds, public systems, browser-agent literature, Jev and lightweight classifier alternatives.
- [Measurements and limitations](docs/BENCHMARKS.md): raw evidence, timing boundaries and reproduction commands.
- [Ordered roadmap](docs/ROADMAP.md): coverage and laptop verification first; real application adapters next; models and the public website afterward.
- [AGENTS.md](AGENTS.md): explicit **no subagents**, **no n8n**, **CPU-first**, and **no unapproved real submissions** rules.

Source is MIT-licensed. The GitHub repository is initially private while research is assembled; hosting and public release have not happened.
