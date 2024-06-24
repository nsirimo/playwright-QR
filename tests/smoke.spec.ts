import { test, expect } from "@playwright/test";
import { QRPage } from "../pages/QRPage";
import { PNG } from "pngjs";
import decodeQR from "jsqr";
import fs from "fs";

const inputUrl = "https://qrstud.io/qrmnky";

test.describe("QR Code Monkey Smoke Tests", () => {
  let qrPage: QRPage;

  test.beforeEach(async ({ page }) => {
    qrPage = new QRPage(page);
    await qrPage.navigate();
    await qrPage.handleCookieConsent();
  });

  test.describe("QR Generator Tests", () => {
    test("should generate a QR Code with default settings", async () => {
      const { defaultQRCodeImage } = qrPage.locators;

      const defaultQRCodeVisible = await defaultQRCodeImage.isVisible();
      expect(defaultQRCodeVisible).toBe(true);

      await qrPage.createQRCode(inputUrl);

      await qrPage.waitForQRCodeVisible();
      const { qrCodeImage } = qrPage.locators;
      const generatedQRCodeVisible = await qrCodeImage.isVisible();
      expect(generatedQRCodeVisible).toBe(true);
    });

    test("should generate and validate a QR Code that has been downloaded as PNG", async () => {
      await qrPage.createQRCode(inputUrl);
      await qrPage.waitForQRCodeVisible();

      const qrDownloadPath = await qrPage.downloadQRCode();
      expect(qrDownloadPath).not.toBeNull();

      const buffer = fs.readFileSync(qrDownloadPath);
      const qrPng = PNG.sync.read(buffer);
      const imageData = new Uint8ClampedArray(qrPng.data);
      const qrCode = decodeQR(imageData, qrPng.width, qrPng.height);

      expect(qrCode?.data).toBe(inputUrl);
      fs.unlinkSync(qrDownloadPath);
    });

    test("should take screenshot of QR code and validate", async () => {
      await qrPage.createQRCode(inputUrl);
      await qrPage.waitForQRCodeVisible();

      const screenshot = await qrPage.takeScreenshotOfQRCode();
      const qrPng = PNG.sync.read(screenshot);
      const imageData = new Uint8ClampedArray(qrPng.data);
      const qrCode = decodeQR(imageData, qrPng.width, qrPng.height);

      if (qrCode) {
        expect(qrCode.data).toBe(inputUrl);
      } else {
        throw new Error("Failed to decode QR code from screenshot");
      }
    });

    test("should add a logo to the QR code", async () => {
      await qrPage.clickLogoAccordion();
      await qrPage.selectFirstLogo();
      await qrPage.clickCreateQRCodeButton();

      await qrPage.waitForQRCodeVisible();
      const { qrCodeImage } = qrPage.locators;
      const generatedQRCodeWithLogoVisible = await qrCodeImage.isVisible();
      expect(generatedQRCodeWithLogoVisible).toBe(true);
    });

    test.describe("UI Tests", () => {
      test("should have expected homepage title", async ({ page }) => {
        await expect(page).toHaveTitle(/QR.*Code.*Monkey/);
      });

      test("should navigate through each tab visibility", async () => {
        const tabIds = await qrPage.fetchTabIds();

        for (const tabId of tabIds) {
          const tabSelector = `a[ng-click="setTab('${tabId.replace(/'/g, "\\'")}')"]`;
          await qrPage.page.click(tabSelector);
          await qrPage.page.waitForSelector(".settings", { state: "visible" });
          const pageContent = await qrPage.page.$(".settings");
          expect(pageContent).toBeTruthy();
        }
      });

      test("should display an error message for invalid url input", async () => {
        await qrPage.fillInvalidUrl();
        const errorMsg = await qrPage.getErrorMessage();
        await expect(errorMsg.isVisible()).resolves.toBe(true);
        await expect(errorMsg.textContent()).resolves.toContain(
          "There are errors you have to fix before generating",
        );
      });
    });
  });
});
