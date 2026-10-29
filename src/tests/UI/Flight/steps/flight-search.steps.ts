import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { FlightsSearchPage } from '../pages/FlightsSearchPage';

const { Given, When, Then } = createBdd();
const pageObject = (page: import('@playwright/test').Page) => new FlightsSearchPage(page);
const chooseAirport = async (
  page: import('@playwright/test').Page,
  which: 'origin' | 'destination',
  code: 'DEL' | 'BOM',
) => {
  const flights = pageObject(page);
  try {
    await flights.selectAirport(which, code);
  } catch (error) {
    if (await flights.isAirportLookupUnavailable()) {
      test.skip(true, 'Booking.com airport suggestions are unavailable in this run.');
    }
    throw error;
  }
};

Given('the user opens the Booking.com flights page', async ({ page }) => {
  const flights = pageObject(page);
  await flights.goto();
  if (await flights.isBotChallenge()) {
    throw new Error('Booking.com presented a bot challenge; the flight scenarios cannot interact with the search form.');
  }
  await flights.waitForFlightFormToLoad();
});

Given('the user selects DEL as the departure airport', async ({ page }) => {
  await chooseAirport(page, 'origin', 'DEL');
});

Given('the user selects BOM as the destination airport', async ({ page }) => {
  await chooseAirport(page, 'destination', 'BOM');
});
Given('the user selects DEL as the destination airport', async ({ page }) => {
  await chooseAirport(page, 'destination', 'DEL');
});

When('the user opens the travel date picker', async ({ page }) => {
  await pageObject(page).openTravelDatePicker();
});

Then('yesterday should be disabled in the calendar', async ({ page }) => {
  await expect(await pageObject(page).yesterdayDateButton()).toBeDisabled();
});

When('the user types unsafe text in the origin airport search', async ({ page }) => {
  const search = await pageObject(page).airportSearchBox('origin');
  await search.fill('<img src=x onerror=window.__flightXss=1>');
});

Then('the airport search should keep the text inert', async ({ page }) => {
  const search = page.getByRole('combobox', { name: /airport or city/i }).last();
  await expect(search).toHaveValue('<img src=x onerror=window.__flightXss=1>');
  expect(await page.evaluate(() => (window as any).__flightXss)).toBeUndefined();
});
When('the user searches from DEL to BOM for {word}', async ({ page }, day: string) => {
  if (day !== 'today' && day !== 'tomorrow') {
    throw new Error('Unsupported travel date: ' + day);
  }
  const flights = pageObject(page);
  try {
    const date = await flights.searchForDate(day === 'today' ? 0 : 1);
    await page.evaluate((selected) => { (window as any).__selectedFlightDate = selected; }, date);
  } catch (error) {
    if (await flights.isAirportLookupUnavailable()) {
      test.skip(true, 'Booking.com airport suggestions are unavailable in this run.');
    }
    throw error;
  }
});
Then('the flight results should reflect the selected route and date', async ({ page }) => {
  const selectedDate = await page.evaluate(() => (window as any).__selectedFlightDate as string);
  await expect(page.locator('body')).toContainText(/Delhi|DEL/i);
  await expect(page.locator('body')).toContainText(/Mumbai|BOM/i);
  await expect(page.locator('body')).toContainText(new RegExp(selectedDate, 'i'));
});
When('the user clicks Explore', async ({ page }) => {
  await pageObject(page).exploreButton().click();
});

Then('the search should be blocked or show validation', async ({ page }) => {
  const fieldError = page.locator('[aria-invalid="true"]');
  const validation = page.getByRole('alert')
    .or(page.getByText(/choose an airport|select an airport|required field|enter a destination/i));
  await expect(fieldError.first().or(validation.first())).toBeVisible();
  await expect(page.getByRole('button', { name: /Trending/i })).not.toBeVisible();
});
When('the user swaps the route', async ({ page }) => {
  await pageObject(page).swapButton().click();
});

Then('the origin and destination values should be exchanged', async ({ page }) => {
  const flights = pageObject(page);
  await expect(flights.originField()).toContainText(/BOM/i);
  await expect(flights.destinationField()).toContainText(/DEL/i);
});
