# Sillage: indexing recovery and adjustment plan

## 一行向けの結論

最優先は記事・商品の追加ではなく、Googleへの登録状況をページ別に確認することです。トップと英語の東京ガイドはGoogleの公開URLテストに合格しましたが、実際の登録は未完了です。「取得可能」と「登録済み」を区別します。

確認できたURLの不具合だけを修正し、2026年11月19日に公開しました。商品データ、計測タグ、アフィリエイトリンク、デザインは変更していません。

今後の順序は、(1) 優先ページの登録状況を記録、(2) 読まれている店舗ガイドの公式情報を点検、(3) 回遊と購入先クリックを正しく計測、(4) 根拠のある記事改善です。大量追加や一括削除は行いません。点数による自己評価ではなく、確認できた証拠と未確認事項で判断します。

Review date: 2026-11-19 (Asia/Tokyo). Evidence, hypotheses and completed work are separated below. No indexing, ranking or revenue outcome is guaranteed by a technical pass.

## Evidence and limitations

- Supplied Search Console overview: 2026-11-16, indexed 1 / not indexed 409 (discovered 364, crawled 42, not found 3). This is a report snapshot, not a current per-URL truth.
- The sole indexed example is `/items/tom-ford-3` (example crawl date 2026-07-13). Its URL Inspection result instead reports crawled, not indexed; last crawl 2026-07-29, fetch successful, crawl and indexing allowed, declared canonical is itself. The overview and URL Inspection disagree.
- Homepage URL Inspection: crawled, not indexed; last crawl 2026-11-19 21:49:15 JST, smartphone Googlebot, successful fetch, crawl and indexing allowed, declared canonical is itself. Sitemap discovery displays a temporary processing error.
- Homepage live test at 2026-11-19 22:01 JST: URL can be indexed. This is not proof that it is indexed or that all ranking conditions are satisfied.
- Search Console sitemap report: `/sitemap.xml`, successful, 402 discovered pages, last read 2026-10-28. Therefore the per-URL temporary sitemap message is not evidence that the whole sitemap is broken.
- Search Console manual actions and security issues: no problems detected at review time.
- English Tokyo guide `/en/guides/perfume-shopping-tokyo/`: URL Inspection says unknown to Google, with no recorded crawl or referring sitemap. Its live test at 2026-11-19 22:13 JST passes: URL can be indexed, with one valid Breadcrumb item. This is a discovery/indexing issue in the recorded state, not proof of a current fetch block. No indexing request was submitted during this audit.
- The 42 historical crawled-not-indexed examples were recorded in `gsc-crawled-examples-2026-11-19.json`. Six are intentionally withdrawn item/brand URLs, not restoration targets. The report is dated November 16; individual URL Inspection may be newer and disagree with it.
- Independent ordinary GET audit: all 402 sitemap URLs returned 200, self canonical, one H1, no detected noindex. Static link graph reaches all 402 from home, maximum depth 3. This does not test verified Googlebot IP access or Google's index decisions. See `indexability-live-audit.json`.
- GA4 export covers 2026-10-22 through 2026-11-18: 127 active users, 134 sessions, 154 views. Four Tokyo/Kyoto/Osaka store guides account for 62 views. Source labels include AI-associated traffic; genuine reader intent cannot be inferred from those labels alone. The data predates the November 19 deployments.

## Confirmed URL defects and minimal repairs

1. `/items/chanel-4/` and `/columns/how-to-wear/` returned duplicate 200 pages despite canonical URLs without the slash. Normalize item and article trailing slashes to the existing canonical path with 301; preserve query strings and the English directory URL convention.
2. Search Console's three historical 404 examples were checked individually:
   - `/items/paco-rabanne-2`: currently intentional 410. Preserve; do not recreate or redirect to an unrelated product.
   - `/brand-issey-miyake.html`: currently 200. No new repair required.
   - `/columns/`: currently 404, although the current article index is `/guides.html`. Redirect this historical listing entry and `/columns` to that real list.
3. These repairs improve URL consistency. Neither explains all 409 exclusions, and neither is presented as the confirmed root cause.

## Ordered work and acceptance gates

| Priority | Work | Evidence required to proceed | Reconsideration / stop condition |
|---|---|---|---|
| 0 | Freeze a dated baseline and reconcile overview with URL Inspection | URL, report date, per-URL state, crawl date, canonical, fetch and indexing permission | Do not translate an old count or a successful live test into current indexed status |
| 1 | Repair confirmed routing defects, test and deploy through existing Actions | 301 targets and queries correct; real 404/410 preserved; all canonical routes and product data unchanged | Stop push if unrelated content, tracking, links or domain settings change |
| 2 | Inspect a small priority cohort: home, English Tokyo/Kyoto/Osaka and Japanese Kyoto guide | Record actual Google state and processing/crawl observations for each; confirm sitemap association | Do not mass-submit hundreds of URLs or repeatedly request indexing without new evidence |
| 3 | Focus editorial checking on those proven entry pages | Recheck official store presence, opening dates/hours, temporary vs permanent status and tax-free caveats | Do not label a whole guide reverified after checking only one store; do not invent live stock |
| 4 | Measure navigation and affiliate clicks as separate outcomes | Landing page and channel scoped sessions; guide-to-product clicks; purchase-link event by product, shop and position; named key event | Do not call one unnamed key event a sale; do not add multiple event types together as conversions |
| 5 | Improve only evidence-supported content and navigation | Search queries/pages, normal-reader engagement and specific unresolved questions | Do not bulk-generate products/articles, remove pages, change slugs, or use noindex to make counts appear better |
| 6 | Evaluate outcomes after processing time | Recheck priority URLs and Search Console on Nov 26, Dec 3 and Dec 17; distinguish crawl, indexing, impressions, clicks and affiliate actions | No rank/revenue claims from 127-user baseline; revise hypotheses if important URLs remain excluded |

## Competing explanations not yet proved

- Current site-wide crawl blocking is not supported by the successful homepage Googlebot fetch and live test, but intermittent historical access problems are not ruled out.
- Manual penalties and detected security problems are not supported by the reviewed reports. Algorithmic selection is a separate matter.
- Content similarity, insufficient independent value, host migration/canonical history and Google's processing priorities remain hypotheses. An HTTP 200 response cannot resolve these.
- All pages being reachable within three static hops contradicts the claim that a general lack of internal links alone explains the exclusions. Quality and relevance of links can still be reviewed on the priority cohort.

## Deployment and subsequent evidence

- Routing commit: `b09a47a46c269457c651b835481944e2128428b3`, deployed through the existing main push / GitHub Actions / Cloudflare Workers workflow on November 19, 2026 (JST).
- Actions: https://github.com/sanji104vt-hub/sillage/actions/runs/44530560935 — success, completed 2026-11-19 22:09:23 JST.
- Production ordinary GET checks: `/columns/` -> 301 `/guides.html`; query strings preserved; `/columns/how-to-wear/` and `/items/chanel-4/` -> 301 canonical no-slash paths. `/items/paco-rabanne-2` remains 410; `/brand-issey-miyake.html` remains 200.
- Passed: JavaScript syntax, routing validator, fragrance validator (209 product pages), homepage payload validator, and `git diff --check`.
- Changed production files: `src/index.js` (minimal alias redirects), `validate-site-routes.mjs` (regression coverage). Canonical URL set and product data are unchanged.
- Live sitemap audit covers 402 URLs. All returned 200 with self canonical and one H1, no detected noindex; all are statically reachable within three links. Ordinary GET is not a substitute for verified Googlebot access or index selection.
- Remaining limitations: Kyoto/Osaka/Japanese Kyoto have not yet received individual Search Console inspections in this pass; URL Inspection is not completed for all 402 URLs. Historical logs and algorithmic selection causes are not established. No broad cache purge, sitemap resubmission, repeated indexing requests or mass content edits were performed.
- Follow-up dates above are review checkpoints, not scheduled automations. The indexing problem remains unresolved until actual Google results change.
