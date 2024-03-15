const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({executablePath: '/Users/brycewood/.cache/puppeteer/chrome/mac_arm-122.0.6261.69/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
    const page = await browser.newPage();
    await page.goto('https://google.com');
    await browser.close();
})();