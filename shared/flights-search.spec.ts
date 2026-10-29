import { expect, test } from '@playwright/test';
import { FlightsSearchPage } from '../src/tests/UI/Flight/pages/FlightsSearchPage';

test.describe('Booking.com flights search page', () => {
  test('search form loads correctly with the route controls', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    await flightsPage.goto();

    if (await flightsPage.isBotChallenge()) {
      test.skip(true, 'Booking.com is serving a bot challenge in this environment.');
    }

    await flightsPage.waitForFlightFormToLoad();

    await expect(flightsPage.originField()).toContainText(/DEL|Delhi/i);
    await expect(flightsPage.destinationField()).toBeVisible();
    await expect(flightsPage.travelDatesField()).toBeVisible();
    await expect(flightsPage.exploreButton()).toBeVisible();
  });

  test('route search fields and trip controls are present for DEL to BOM usage', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    await flightsPage.goto();

    if (await flightsPage.isBotChallenge()) {
      test.skip(true, 'Booking.com is serving a bot challenge in this environment.');
    }

    const tripOptions = page.locator('input[name="sr_search_type"]');
    await expect(tripOptions).toHaveCount(3);
    await expect(flightsPage.travellersField()).toBeVisible();
    await expect(flightsPage.travelDatesField()).toContainText(/\d{1,2}\s[A-Za-z]{3}/i);
  });

  test('destination route field and swap control remain available in the form', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    await flightsPage.goto();

    if (await flightsPage.isBotChallenge()) {
      test.skip(true, 'Booking.com is serving a bot challenge in this environment.');
    }

    await expect(flightsPage.originField()).toBeVisible();
    await expect(flightsPage.destinationField()).toBeVisible();
    await expect(flightsPage.swapButton()).toBeVisible();
  });
});
