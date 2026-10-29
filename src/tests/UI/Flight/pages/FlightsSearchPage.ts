import { expect, type Locator, type Page } from '@playwright/test';

export class FlightsSearchPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/flights/index.en-gb.html', {
      waitUntil: 'load',
      timeout: 60_000,
    });
    await this.page.waitForTimeout(2_000);
  }

  originField(): Locator {
    return this.page.getByRole('button', { name: /Leaving from/i }).first();
  }

  destinationField(): Locator {
    return this.page.getByRole('button', { name: /Going to/i }).first();
  }

  travelDatesField(): Locator {
    return this.page.getByRole('button', { name: /Travel dates/i }).first();
  }

  travellersField(): Locator {
    return this.page.getByRole('button', { name: /Travellers/i }).first();
  }

  exploreButton(): Locator {
    return this.page.getByRole('button', { name: /Explore/i }).first();
  }

  swapButton(): Locator {
    return this.page.getByRole('button', { name: /Switch origin and return destinations|Swap/i }).first();
  }

  async waitForFlightFormToLoad() {
    await expect(this.originField()).toBeVisible({ timeout: 30_000 });
    await expect(this.destinationField()).toBeVisible();
    await expect(this.travelDatesField()).toBeVisible();
    await expect(this.exploreButton()).toBeVisible();
  }

  async isBotChallenge(): Promise<boolean> {
    const bodyText = (await this.page.locator('body').innerText()).toLowerCase();
    return bodyText.includes('verify that you are not a robot')
      || bodyText.includes('javascript is disabled')
      || this.page.url().includes('__challenge');
  }

  async openTravelDatePicker() {
    await this.travelDatesField().click();
  }

  async yesterdayDateButton(): Promise<Locator> {
    const yesterday = new Date();
    yesterday.setHours(12, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    const label = yesterday.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const date = this.page.getByRole('checkbox', {
      name: new RegExp(label.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&')),
    });

    if (!(await date.isVisible().catch(() => false))) {
      await this.page.getByRole('button', { name: 'Previous month' }).click();
    }
    return date;
  }
  async airportSearchBox(which: 'origin' | 'destination'): Promise<Locator> {
    const field = which === 'origin' ? this.originField() : this.destinationField();
    const search = this.page.getByRole('combobox', { name: /airport or city/i }).last();
    const addAnother = this.page.getByText('Add another airport or city', { exact: true }).last();

    await field.click();
    if (await addAnother.isVisible().catch(() => false)) {
      await addAnother.click();
    }

    if (!(await search.isVisible().catch(() => false))) {
      await field.click();
      if (await addAnother.isVisible().catch(() => false)) {
        await addAnother.click();
      }
    }

    await expect(search).toBeVisible({ timeout: 10_000 });
    return search;
  }

  async isAirportLookupUnavailable(): Promise<boolean> {
    return this.page.getByText(/Oops, something's not right/i).isVisible().catch(() => false);
  }
  async selectAirport(which: 'origin' | 'destination', code: 'DEL' | 'BOM') {
    const field = which === 'origin' ? this.originField() : this.destinationField();
    if (new RegExp(code, 'i').test(await field.innerText())) return;

    const search = await this.airportSearchBox(which);
    await search.fill(code);

    const option = this.page.getByRole('option', { name: new RegExp(code, 'i') }).first();
    const lookupError = this.page.getByText(/Oops, something's not right/i);
    await expect.poll(async () =>
      (await option.count()) > 0
      || await lookupError.isVisible().catch(() => false),
    ).toBeTruthy();

    if (await lookupError.isVisible().catch(() => false)) {
      throw new Error('AIRPORT_LOOKUP_UNAVAILABLE');
    }
    await option.click();
    await expect(field).toContainText(new RegExp(code, 'i'));
  }
  async selectTravelDate(offsetDays: 0 | 1): Promise<string> {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const shortMonth = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const escapedMonth = month.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const datePattern = new RegExp(`(?:${day}\\s+${escapedMonth}| ${escapedMonth} ${day})(?:,? ${year})?`, 'i');

    await this.travelDatesField().click();
    const dateButton = this.page.getByRole('button', {
      name: new RegExp(`(?:${day}\\s+${escapedMonth}|${escapedMonth} ${day})(?:,? ${year})`, 'i'),
    }).first();

    if (await dateButton.count()) await dateButton.click();
    else {
      const dayButton = this.page.getByRole('button', { name: new RegExp(`^${day}$`) }).first();
      await expect(dayButton, `date ${day} ${month} ${year} should be available in the calendar`).toBeVisible();
      await dayButton.click();
    }

    const displayPattern = new RegExp(`(?:${day}\\s+(?:${escapedMonth}|${shortMonth})|(?:${escapedMonth}|${shortMonth}) ${day})(?:,? ${year})?`, 'i');
    await expect(this.travelDatesField()).toContainText(displayPattern);
    return `${day} ${month} ${year}`;
  }

  async searchForDate(offsetDays: 0 | 1): Promise<string> {
    await this.selectAirport('origin', 'DEL');
    await this.selectAirport('destination', 'BOM');
    const date = await this.selectTravelDate(offsetDays);
    await this.exploreButton().click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    return date;
  }

}
