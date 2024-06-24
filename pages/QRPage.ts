import { Page, Locator } from "@playwright/test";

class QRLocators {
  readonly page: Page;
  readonly cookieConsentButton: Locator;
  readonly urlInput: Locator;
  readonly createButton: Locator;
  readonly downloadButton: Locator;
  readonly logoAccordion: Locator;
  readonly firstLogo: Locator;
  readonly qrCodeImage: Locator;
  readonly defaultQRCodeImage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookieConsentButton = page.locator("#onetrust-accept-btn-handler");
    this.urlInput = page.locator("#qrcodeUrl");
    this.createButton = page.locator("#button-create-qr-code");
    this.downloadButton = page.locator("#button-download-qr-code-png");
    this.logoAccordion = page.locator("div[ng-class*=\"editView==='logo'\"]");
    this.firstLogo = page.locator(".shape-options .shape.ng-scope").first();
    this.qrCodeImage = page.locator('img[src*="api.qrcode-monkey.com/tmp/"]');
    this.defaultQRCodeImage = page.locator(
      'img[src="/img/default-preview-qr.svg"]',
    );
    this.errorMessage = page.locator(".alert-danger");
  }
}

export class QRPage {
  readonly page: Page;
  readonly locators: QRLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new QRLocators(page);
  }

  async navigate() {
    await this.page.goto("/");
  }

  async handleCookieConsent() {
    const { cookieConsentButton } = this.locators;
    if (await cookieConsentButton.isVisible()) {
      await cookieConsentButton.click();
    }
  }

  async createQRCode(url: string) {
    const { urlInput, createButton } = this.locators;
    await urlInput.fill(url);
    await createButton.click();
  }

  async clickCreateQRCodeButton() {
    const { createButton } = this.locators;
    await createButton.click();
  }

  async downloadQRCode() {
    const { downloadButton } = this.locators;
    await downloadButton.click();
    const [download] = await Promise.all([this.page.waitForEvent("download")]);
    return download.path();
  }

  async clickLogoAccordion() {
    const { logoAccordion } = this.locators;
    await logoAccordion.click();
  }

  async selectFirstLogo() {
    const { firstLogo } = this.locators;
    await firstLogo.click();
  }

  async takeScreenshotOfQRCode() {
    const { qrCodeImage } = this.locators;
    return await qrCodeImage.screenshot({ type: "png" });
  }

  async waitForQRCodeVisible() {
    const { qrCodeImage } = this.locators;
    return qrCodeImage.waitFor({ state: "visible", timeout: 60000 });
  }

  async waitForDefaultQRCodeVisible() {
    const { defaultQRCodeImage } = this.locators;
    return defaultQRCodeImage.isVisible({ timeout: 10000 });
  }

  async fetchTabIds(): Promise<string[]> {
    const tabIds: (string | null)[] = await this.page.evaluate(() => {
      const tabElements = document.querySelectorAll("a.tab");
      return Array.from(tabElements).map((el) => {
        const ngClick = el.getAttribute("ng-click");
        if (ngClick) {
          const match = /setTab\('(.*)'\)/.exec(ngClick);
          return match ? match[1] : null;
        }
        return null;
      });
    });
    return tabIds.filter((id) => id !== null) as string[];
  }

  async fillInvalidUrl() {
    const { urlInput, createButton } = this.locators;
    await urlInput.fill("not-a-url");
    await createButton.click();
  }

  async getErrorMessage() {
    const { errorMessage } = this.locators;
    return errorMessage;
  }
}
