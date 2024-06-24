# QR Code Monkey Smoke Test Suite

## Introduction

This project contains a suite of smoke tests for the [QR Code Monkey](https://www.qrcode-monkey.com) website. These tests are written using [Playwright](https://playwright.dev/) and TypeScript, designed to ensure the main functionality of the site is working.

## Challenges

The website is rich in terms of selector attributes so I found no problems in dealing with the selectors. However, after testing and writing code I ran out of QR generations for the day. This put a huge pause in my development work as I'll have to wait till the next day in order to keep testing.

Another fun challenge was getting the QR code parsed, this was fun to do as I had to use very specific types for the library I was using but Playwright does have a screenshot function so that was very helpful.

## Questions and Assumptions

### Questions

1. I have two tests specifically that decode the QR code. One that takes a screenshot of the QR code on the webpage and one that downloads the QR code then decodes it. Is there ever a time where what is shown on the webpage doesn't match with what is downloaded?
2. In my test for downloading a generated QR code in .png, I had to transform my png image to an Uint8ClampedArray type. Is there a faster or more efficient way you'd recommend?
3. This is just a question about Bitly and not the project. What metrics and observability does the quality team work with at Bitly?

### Assumptions

The project is straight forward for the most part but I did have one thing. I'm assuming that I will not get rate limited or blocked by running my automation constantly. I was actually IP blocked for a day as I ran out of free code generations. I used a VPN to bypass and keep testing.

## Design Choices

I went with Playwright because I have been using it for the past 3 years and I really enjoy the documentation and minimal set up. I decided to test 3 different browsers in headless mode for speed so all my automation tests will use chromium, firefox, and webkit. For reference, I have used other automation tech before like Cypress, Selenium, Puppeteer, etc. I just wanted to write this in Playwright for fun! If you'd like it in a different language, I'm happy to supply that.

I also added a standard github actions workflow file, if you want to just run the tests through my repo, you can just run the job in there and it will test 7 smoke tests on 3 different browsers using 1 worker and show the results.

Typescript is the language I wrote this project in, I hope that is okay! I just enjoy using Typescript.

## Features Tested

The test suite covers the following features of the QR Code Monkey website:

1. **Homepage Load**: Verifies that the homepage loads correctly.
2. **Dynamic Tabs**: Verifies that the content on each tab is visible, will get all tabs and do a quick test for each one.
3. **Display Error Message for URL Input**
4. **Adds a logo to the QR**
5. **QR Code Generation for Webpage QR**: Ensures that QR codes are generated and takes a screenshot of the QR code, then decodes the QR.
6. **\*QR Code Generation for Downloaded QR**: Ensures that QR codes are generated and decodes the QR in png.
7. **Cookie Consent**: Added cookie consent code to bypass the pop up if it does come up.

## Future Plans

- Add more tests for QR color change, setting other basic features, and other QR code types
- Test more accessibility as I noticed the page does have selectors that can be tested
- Add linting and prettier to code base for better format on save and CI using Github Actions

## How to Run the Tests

### Prerequisites

1. [Node.js](https://nodejs.org/) installed on your machine.
2. [Playwright](https://playwright.dev/) installed as a dependency.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/nsirimo/playwright-qr.git
   cd playwright-qr
   ```
2. Install the dependencies:
   ```
    npm install
    npx playwright install
   ```

### Running the Tests

To execute the tests, run the following command:

```
npm run smoke
```
