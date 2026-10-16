# ApplyBurst demo

Detailed CPU-only job search, read-only application requirement inspection, template email drafts, and real multipart submissions to an explicitly labeled sandbox. No LLM, GPU, n8n, recruiter email, or employer submission is used.

The repository's `demo/` directory mirrors this website's source. The Python core, research, measurements, and roadmap are at [isobed18/applyburst](https://github.com/isobed18/applyburst).

## Try it

1. Search complete job descriptions and normalized fields. Example: `skill:python AND (backend OR "distributed systems") NOT level:senior`.
2. Refine workplace, seniority, location, technology mentions, employment type, known annual USD salary, and observation age. Unknown facts remain unknown. Scores express lexical evidence, not candidate eligibility.
3. Open a job's Prepare panel to inspect its real Greenhouse question schema or download a synthetic email draft. Other form families explicitly require browser inspection.
4. Select up to 50 matching opportunities, review Application batch, and run sandbox applications. Each request uploads real synthetic resume bytes; the receiver checks six answers, stores an idempotent receipt in D1, and is read again to verify persistence.
5. System lab shows this browser's measured timing, source failures, data completeness, and application limitations. Refresh feeds performs public GET requests and retains previous postings from failed boards with their original observation ages.

Nine boards are a seed, not market-wide coverage. Remote does not establish worldwide eligibility. Recognizing a required field does not establish a working submission adapter. **Real employer adapters: zero.**

## Develop

Use Node 22.13 or later. On a normal workstation:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lazy_slayback.sql
npm run dev -- --port 5175
```

Apply the initial migration once per fresh local database. Hosted deployments apply the committed schema migrations through Sites. The site uses Cloudflare Workers, D1 (`DB`), and R2 (`BUCKET`). The bundled snapshot works before the first live refresh.

```sh
node scripts/build-search-index.mjs
node scripts/benchmark-search.mjs
node scripts/smoke-sandbox.mjs http://127.0.0.1:5175
```

To replace the bundled data, run `python -m applyburst.export_catalog --output demo/public/jobs.json` from the main repository root, then rebuild the search index from this directory. Do not export candidate data. Keep source credentials and runtime state out of Git.

The catalog and prebuilt inverted index are downloaded once per page initialization; queries run in a Web Worker. The packed index is used only when its revision and posting identities match the catalog; refreshed data otherwise builds an index locally. At larger catalog sizes, move retrieval to a shared search service instead of downloading a market-wide index to every browser.

See [STARTER.md](STARTER.md) for the retained Vinext/Sites build and deployment tooling. Application code is in `app/`, `lib/`, and `public/search-*.mjs`; unit tests are in `tests/`.
