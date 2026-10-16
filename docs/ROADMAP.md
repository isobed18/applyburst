# Ordered milestones

## 1. Discovery quality and speed — current work

- Expand the verified registry beyond the nine-board seed. Track board migrations, regional endpoints, dead boards and source failures explicitly.
- Add explicit country/remote restrictions and normalize employment type/seniority. Treat missing data as unknown. Measure recall and freshness on an English/Turkish target set.
- Add cross-source canonical application identities before combining LinkedIn and employer records.
- Keep crawlers out of interactive search; return indexed results while individual refreshes finish.
- Validate the CPU-only install and actual request latency on the user's laptop, with GPU disabled. Desktop measurements do not satisfy the laptop gate.

Candidate acceptance targets, not achieved production guarantees: 50 unique relevant fresh results; warm HTTP search p95 below 250ms on the laptop; a documented coverage denominator and explicit partial-source status. Measure cold bootstrap separately.

## 2. Real application adapters

Start with one hosted ATS form family and reviewed test data. Implement schema extraction, required-field detection, file upload, known-fact mapping, version checks and provider-specific confirmation evidence. Validate at least five different employers and the conditional-question failure paths before promising coverage of that ATS.

Record discovered → eligible → prepared → attempted → confirmed outcomes separately. Expand to a second form family and the explicit mail-application path. Preserve sessions locally and keep browser concurrency at two until laptop measurements justify more. Test rate-constrained cases and unknown-after-timeout reconciliation. No actual employer or email submissions have occurred in this baseline.

## 3. Classifiers only where they improve measured results

Compare rules/BM25, a small trained classifier, Model2Vec, GLiClass, GLiNER2.5-Decide, Laya and Jev on the project-specific task set. Evaluate load time, peak RAM, end-to-end latency, accuracy, abstention and actual hosted cost. No GPU is required for the initial evaluation. Add generative email writing only if templates fail the product-quality test.

## 4. Demo and publication

Build the try-it website on the discovery/preparation/execution API. Provide a clearly labeled sandbox mode that really receives fixture applications and produces receipts, plus a separately authorized real mode limited to verified adapters. Display failures and supported coverage next to timing. Show reproducible benchmark reports and source code.

The baseline GitHub repository is private while this research is assembled. Source is MIT-licensed and structured for later public release. Public demo hosting and repository publication are later milestones; they have not happened in this task.
