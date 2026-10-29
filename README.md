# Flight Search UI Automation

Playwright and playwright-bdd automate selected flight-search scenarios on Booking.com's flights page. Scenarios are written in Gherkin and implemented with a page object and step definitions.

## Project structure

```text
src/tests/UI/Flight/
  features/flight_search.feature
  pages/FlightsSearchPage.ts
  steps/flight-search.steps.ts

shared/
  flights-search.spec.ts

reporters/
  console-table-reporter.js

playwright.config.ts
```

## Setup

From the project root, install dependencies and Chromium:

```powershell
npm ci
npx playwright install chromium
```

## Run tests

Generate BDD tests and run the full suite:

```powershell
npm run bdd:full
```

Run one scenario by case ID:

```powershell
npx playwright test --grep TC11
```

Replace TC11 with TC04, TC06, TC07, or TC12 to select another case. TC03 has today and tomorrow examples, so `--grep TC03` runs both.

Run only the BDD generator with `npm run bdd:gen`. Run already generated tests and shared smoke specs with `npm run bdd:run`.

## Automated scenarios

- **TC03:** Search DEL to BOM for today and tomorrow.
- **TC04:** Check that yesterday is disabled in the date picker.
- **TC06:** Check that a search with an empty destination is blocked with validation.
- **TC07:** Check that using DEL for both airports is blocked.
- **TC11:** Check that script-like text stays inert in the airport search field.
- **TC12:** Check that swapping the route exchanges the airports.

`shared/flights-search.spec.ts` contains three smoke checks for the search form and its controls.

## Console and HTML reports

Playwright prints a console table with each test's status, name, duration, and totals. Failed tests include a short reason below the table. An HTML report is also created in `playwright-report/`.

## Live-site notes

These tests use the live Booking.com flight page, so results depend on the site and its airport lookup service. When the airport picker displays "Oops, something's not right," airport-dependent scenarios may be skipped. TC06 currently fails when Booking.com does not show the expected empty-destination validation; review that result as a behavior mismatch against the case expectation.