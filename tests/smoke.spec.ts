import { test, expect, Page } from "@playwright/test";
import { PNG } from "pngjs";
import decodeQR from "jsqr";
import fs from "fs";

test.describe("QR Code Monkey Smoke Tests", () => {
  const inputUrl = "https://qrstud.io/qrmnky";

  test.beforeEach(async ({ page }) => {
    // Cookie Consent bypass in case it shows up
    await page.goto("/");
    const cookieConsentButton = page.locator("text=Accept");
    if (await cookieConsentButton.isVisible()) {
      await cookieConsentButton.click();
    }
  });

  async function createQRCode(page: Page): Promise<void> {
    await page.fill("#qrcodeUrl", inputUrl);
    await page.click("#button-create-qr-code");
  }

  test.describe("QR Generator Tests", () => {
    test("should generate a QR Code with default settings", async ({
      page,
    }) => {
      await expect(
        page.locator('img[src="/img/default-preview-qr.svg"]'),
      ).toBeVisible({ timeout: 10000 });

      createQRCode(page);

      await expect(
        page.locator('img[src*="api.qrcode-monkey.com/tmp/"]'),
      ).toBeVisible({ timeout: 60000 });
    });

    test("should generate and validate a QR Code", async ({ page }) => {
      createQRCode(page);
      await expect(
        page.locator('img[src*="api.qrcode-monkey.com/tmp/"]'),
      ).toBeVisible({ timeout: 60000 });

      await page.click("#button-download-qr-code-png");
      const [download] = await Promise.all([page.waitForEvent("download")]);

      const qrDownloadPath = await download.path();
      expect(qrDownloadPath).not.toBeNull();
      const buffer = fs.readFileSync(qrDownloadPath);

      const qrPng = PNG.sync.read(buffer);
      const imageData = new Uint8ClampedArray(qrPng.data);

      const qrCode = decodeQR(imageData, qrPng.width, qrPng.height);
      expect(qrCode?.data).toBe(inputUrl);
      fs.unlinkSync(qrDownloadPath);
    });

    test("should take screenshot of QR code and validate", async ({ page }) => {
      createQRCode(page);
      await expect(
        page.locator('img[src*="api.qrcode-monkey.com/tmp/"]'),
      ).toBeVisible({ timeout: 10000 });

      // Take screenshot of the QR code on the webpage
      const screenshot = await page
        .locator('img[src*="api.qrcode-monkey.com/tmp/"]')
        .screenshot({
          type: "png",
        });

      const qrPng = PNG.sync.read(screenshot);

      // Decode the QR code from the screenshot
      const imageData = new Uint8ClampedArray(qrPng.data);
      const qrCode = decodeQR(imageData, qrPng.width, qrPng.height);

      if (qrCode) {
        expect(qrCode.data).toBe(inputUrl);
      } else {
        throw new Error("Failed to decode QR code from screenshot");
      }
    });

    test("should add a logo to the QR code", async ({ page }) => {
      const logoAccordion = page.locator(
        "div[ng-class*=\"editView==='logo'\"]",
      );
      await logoAccordion.click();

      const firstLogo = page.locator(".shape-options .shape.ng-scope").first();
      await expect(firstLogo).toBeVisible();
      createQRCode(page);
      await expect(
        page.locator('img[src*="api.qrcode-monkey.com/tmp/"]'),
      ).toBeVisible({ timeout: 60000 });
    });
  });

  test.describe("UI Tests", () => {
    async function fetchTabIds(page: Page): Promise<string[]> {
      // Evaluate JavaScript on the page to fetch tab IDs
      const tabIds: (string | null)[] = await page.evaluate(() => {
        const tabElements = document.querySelectorAll("a.tab");
        const ids = Array.from(tabElements).map((el) => {
          // Extract the tab ID from the ng-click attribute
          const ngClick = el.getAttribute("ng-click");
          if (ngClick) {
            const match = /setTab\('(.*)'\)/.exec(ngClick);
            if (match && match[1]) {
              return match[1];
            }
          }
          return null;
        });
        return ids;
      });

      // Filter out null values and convert to string array
      const filteredTabIds = tabIds.filter((id) => id !== null) as string[];
      return filteredTabIds;
    }

    test("should have expected homepage title", async ({ page }) => {
      await expect(page).toHaveTitle(/QR.*Code.*Monkey/);
    });

    test("should navigate through each tab visibility", async ({ page }) => {
      // Fetch tab IDs dynamically from the website
      const tabIds: string[] = await fetchTabIds(page);

      // Iterate through each tab ID, with replace regex for double quotes
      for (const tabId of tabIds) {
        const tabSelector = `a[ng-click="setTab('${tabId.replace(/'/g, "\\'")}')"]`;
        await page.click(tabSelector);

        await page.waitForSelector(".settings", { state: "visible" });
        const pageContent = await page.$(".settings");
        expect(pageContent).toBeTruthy();
      }
    });

    test("should display an error message for invalid url input", async ({
      page,
    }) => {
      const createButton = page.locator("button", {
        hasText: "Create QR Code",
      });
      await createButton.click();

      await page.fill("#qrcodeUrl", "not-a-url");
      await page.click("#button-create-qr-code");

      // Error above generate QR button
      const generateBtnErrMsg = page.locator(".alert-danger");
      await expect(generateBtnErrMsg).toBeVisible();
      await expect(generateBtnErrMsg).toHaveText(
        /There are errors you have to fix before generating/,
      );
    });
  });
});
