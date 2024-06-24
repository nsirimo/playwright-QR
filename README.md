# QR Code Monkey Smoke Test Suite

## Introduction

This project contains a suite of smoke tests for the [QR Code Monkey](https://www.qrcode-monkey.com) website. These tests are written using [Playwright](https://playwright.dev/) and TypeScript, designed to ensure the main functionality of the site is working.

## Challenges

The website is rich in terms of selector attributes so I found no problems in dealing with the selectors. However, after testing and writing code I ran out of QR generations for the day. This put a huge pause in my development work as I'll have to wait till the next day in order to keep testing.

Another fun challenge was getting the QR code parsed, this was fun to do as I had to use very specific types for the library I was using but Playwright does have a screenshot function so that was very helpful.

## Design Choices

I went with Playwright because I have been using it for the past 3 years and I really enjoy the documentation and minimal set up. I decided to test 3 different browsers in headless mode for speed.

Typescript is the language I wrote this project, I hope that is okay!

## Features Tested

The test suite covers the following features of the QR Code Monkey website:

1. **Homepage Load**: Verifies that the homepage loads correctly.
2. **Dynamic Tabs**: Verifies that the content on each tab is visible, will get all tabs and do a quick test for each one.
3. **Display Error Message for URL Input**
4. **Adds a logo to the QR**
5. **QR Code Generation for Webpage QR**: Ensures that QR codes are generated and takes a screenshot of the QR code, then decodes the QR.
6. **\*QR Code Generation for Downloaded QR**: Ensures that QR codes are generated and decodes the QR in png.

## Future Plans

- Add more tests for QR color change, setting other basic features, and other QR code types
- Test more accessibility as I noticed the page does have selectors that can be tested
- Add linting and prettier to code base for better format on save and CI

## How to Run the Tests

### Prerequisites

1. [Node.js](https://nodejs.org/) installed on your machine.
2. [Playwright](https://playwright.dev/) installed as a dependency.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/nsirimo/playwright-qr.git
   cd qrcode-monkey-smoke-tests
   ```
2. Install the dependencies:
   ```
    npm install
   ```

### Running the Tests

To execute the tests, run the following command:

```
npx playwright test
```
