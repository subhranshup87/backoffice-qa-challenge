# Backoffice: QA take-home exercise

An internal backoffice for customer operations: customer accounts, their daily deposit and
withdrawal limits, transaction history, and a payout approval queue.

Your job is to test it, report what you find, and show your reasoning.

## The exercise

**Timebox: four hours.** Please stop there. Partial work with good reasoning is preferred to
rushed breadth. A smaller amount of well-chosen, well-argued testing scores better here than a
wide sweep with thin justification. If you run out of time, say what you would have done next in
`decisions.md`; that answer counts.

Defects have been introduced into this application deliberately. We are not telling you how many
there are or where they live. Treat the application as something you have been asked to audit, not
as something you are assuming is correct.

What we ask you to produce:

1. **`bug-reports.md`**: the defects you found. It ships empty. There is no template. Please also
   prioritise your findings.
2. **Tests**: written at whichever layer fits the risk you are covering. Both Vitest and
   Playwright are configured and each has one passing example test, so you should not need to spend
   any of your four hours on build configuration.
3. **One fix**: pick exactly one defect, fix it, and accompany the fix with a regression test that
   fails against the defect and passes against your fix. Fix only one. We care less about the fix
   itself than about which defect you judged worth fixing, and why.
4. **`decisions.md`**: eight prompts, shipped empty. Answer them in your own words.

Please commit as you go rather than in a single commit at the end. Your commit history comes with
the submission and we do read it.

## Rules of engagement

- **Additional tooling is permitted.** If a linter, an assertion library, an accessibility
  scanner or anything else helps you, add it, provided you justify the choice in `decisions.md`.
- **AI assistance is permitted**, provided you disclose where you used it in `decisions.md`. We are
  interested in how you actually work, not in a performance of working without it.
- **Authentication is out of scope.** There is no login and that is intentional; please do not
  report its absence as a defect.
- There is no database and no seed step. Data lives in memory and is reseeded when the server
  restarts, so restarting `pnpm dev` gets you back to a known state. There is no reset endpoint, so
  if a test decides a payout, that payout stays decided until you restart.

## Getting started

Requires **Node 20.9 or newer** and pnpm.

```bash
pnpm install
pnpm exec playwright install chromium   # one-off, for the end-to-end tests
pnpm dev
```

The application is served at http://localhost:3000 and opens on the customer list.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Runs the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serves the production build |
| `pnpm test` | Unit and component tests, once (Vitest + Testing Library) |
| `pnpm test:watch` | The same tests, in watch mode |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | ESLint |

`pnpm test` picks up `src/**/*.test.ts` and `src/**/*.test.tsx`. `pnpm test:e2e` picks up
`tests/e2e/`, and starts a development server itself if one is not already running.

## The application

Three screens, plus the route handlers behind them:

| Screen | Route | API |
|---|---|---|
| Customer list | `/` | `GET /api/customers` |
| Customer detail | `/customers/:id` | `GET /api/customers/:id`, `PATCH /api/customers/:id` |
| Payout queue | `/payouts` | `GET /api/payouts`, `POST /api/payouts/:id/approve`, `POST /api/payouts/:id/reject` |

The route handlers are reachable directly. You are not restricted to testing through the browser.

## Specification

This describes the behaviour the application is supposed to have. It is **not exhaustive**. It
covers the areas where being wrong costs money or breaks a workflow, and it is silent on plenty of
other things. If you find behaviour this specification does not cover, that is not automatically a
defect; how you handle the gap is up to you.

### Money

1. Every monetary amount is held as an integer number of cents. Wherever an amount is displayed
   (tables, summaries, confirmations) it is rendered as EUR in the `de-DE` convention: dot for
   thousands, comma for decimals, symbol last, always two decimal places, `1.234,56 €`. An editable
   amount field is the exception: it drops the currency symbol, and a whole-euro amount carries no
   decimal part, so that an untouched field round-trips unchanged. The interface language is
   English.
2. Amount inputs accept the same convention: an optional dot-grouped thousands part, an optional
   comma decimal part of one or two digits, and an optional trailing euro sign. `1.500` and `1500`
   are the same amount; `1.500,50` and `1.500,50 €` are the same amount. Input that cannot be read
   unambiguously is rejected with a field-level error rather than guessed at, and an accepted amount
   is stored as the amount that was typed: entering `50,00` stores fifty euros.
3. A table column of monetary amounts sorts by the value of the amount, not by the text it is
   rendered as, in both directions.

### Customer list

4. Search matches a case-insensitive substring of either the customer's name or their email
   address. The KYC status filter narrows the list to customers with that status. Both the name and
   the daily deposit limit columns are sortable, ascending and descending, defaulting to name
   ascending.
5. The list is paginated at ten customers per page, and reports the current page, the total number
   of pages, and how many customers match the current filters.
6. Search term, KYC status filter and sort order all survive moving between pages. Paging changes
   which slice of the results you see and nothing else. Changing the search term, the filter or the
   sort order returns to the first page, because the old page number means nothing against a
   different set of results.
7. The whole state of the list (search, filter, sort, page) lives in the URL, so that a link
   reproduces exactly the view the operator was looking at.

### Limits

8. Each customer sits in a tier, and the tier fixes the maximum daily deposit and withdrawal limits
   an operator may set. Tier is not editable in the backoffice.

   | Tier | Daily deposit cap | Daily withdrawal cap |
   |---|---|---|
   | Bronze | 1.000,00 € | 500,00 € |
   | Silver | 5.000,00 € | 2.500,00 € |
   | Gold | 20.000,00 € | 10.000,00 € |

9. A limit **must not exceed** the cap for the customer's tier. A limit exactly equal to the cap is
   permitted; any amount above the cap is rejected, however small the excess.
10. The daily withdrawal limit must not exceed the daily deposit limit, and neither limit may be
    negative.
11. When a submitted limit is rejected, nothing is saved (the customer keeps the limits they had)
    and the reason is reported against the field that caused it. When it is accepted, both limits
    are saved together.

### Transaction history

12. A customer's transaction history shows the date, reference, type (deposit or withdrawal) and
    amount of each transaction, sortable by date and by amount in both directions, defaulting to
    newest first.

### Payouts

13. A payout is `pending`, `approved` or `rejected`. `pending` is the only state a decision can be
    taken from, and both decisions are terminal: nothing reopens a decided payout. The queue shows
    the payouts still awaiting a decision, longest waiting first. A payout records the time it was
    decided; that is empty for as long as it is pending.
14. A payout may be approved only if the customer's KYC status is `verified`. A payout may be
    rejected regardless of KYC status. Rejection is irreversible and is confirmed before it is
    applied.
15. A decision request against a payout that has already been decided is refused and leaves the
    payout exactly as it was. A decision request against a payout that does not exist is refused.
16. Approving a payout books exactly one withdrawal transaction against the customer, for the payout
    amount, referenced `Payout <payout id>`. A payout is booked at most once in its lifetime, no
    matter how the approval was requested. Rejecting a payout books nothing.

These are properties of the API, which is where they are enforced. The interface may additionally
hide or disable a control to keep an operator out of trouble, but that is a convenience for the
operator rather than the guard.
