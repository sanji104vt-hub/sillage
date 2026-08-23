# Sillage Phase 0 multilingual readiness audit

Generated: 2026-08-23T14:53:44.210Z

## Scope

- Products: 150
- Brands: 41
- Kyoto shop records: 18
- Existing Japanese static HTML: 234 pages
- Generated English Phase 1 HTML: 7 pages
- Total after Phase 1 generation: 241 pages (240 indexable / 1 noindex)
- English pilot records: 5

## Product field completeness

| Field | Present | Missing | Missing rate |
| --- | ---: | ---: | ---: |
| brand | 150 | 0 | 0.0% |
| nameJa | 150 | 0 | 0.0% |
| gender | 150 | 0 | 0.0% |
| family | 150 | 0 | 0.0% |
| topNote | 150 | 0 | 0.0% |
| middleNote | 150 | 0 | 0.0% |
| lastNote | 150 | 0 | 0.0% |
| seasons | 146 | 4 | 2.7% |
| scenes | 146 | 4 | 2.7% |
| priceTier | 121 | 29 | 19.3% |
| displayedPrice | 121 | 29 | 19.3% |
| concentration | 142 | 8 | 5.3% |
| sizes | 118 | 32 | 21.3% |
| image | 150 | 0 | 0.0% |
| officialLink | 65 | 85 | 56.7% |
| rakutenLink | 149 | 1 | 0.7% |
| sources | 90 | 60 | 40.0% |
| verifiedAt | 150 | 0 | 0.0% |
| updatedAt | 150 | 0 | 0.0% |
| nameEn | 5 | 145 | 96.7% |
| englishSlug | 5 | 145 | 96.7% |

The Japanese dataset remains the single source of truth. English fields are stored as a sparse overlay keyed by the existing Japanese slug.

## Severity summary

| Severity | Findings |
| --- | ---: |
| critical | 0 |
| high | 60 |
| medium | 102 |
| low | 0 |

Critical means the page cannot be identified or safely generated. High means a public link, image, price relation or visible count needs correction. Medium means the page can be generated but should not be treated as fully verified or index-ready. Low is informational.

## Kyoto article consistency

- Visible title/body count: 17
- Shop data count: 18
- ItemList JSON-LD count: 18
- Result: inconsistent; do not translate or index an English city page until manually corrected

No Kyoto shop name, address, opening hour or map link was changed by this audit.

## External link audit

The affiliate tracking URL itself was not requested. For Moshimo links, the embedded Rakuten destination URL was checked instead.

| Status | Unique destinations |
| --- | ---: |
| blocked | 46 |
| manual_review | 1 |
| ok | 19 |
| redirect | 6 |
| timeout | 153 |

403 responses are classified as blocked, not broken. Timeouts and manual_review require browser verification before changing any product record. Only HTTP 404 or 410 is treated as not_found.

## Phase 1 decision

- Keep all existing Japanese routes and records unchanged.
- Use five verified pilot overlays only.
- Suppress purchase links carrying the internal needsCorrectLink flag.
- Keep the full English catalogue noindex until English names and destination coverage are materially complete.
- Index only the English home and pilot detail pages after local checks pass.
