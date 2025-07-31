const { error } = require('console');
const puppeterr = require("puppeteer");


async function websiteHostingCheck() {
    try {
        const browser = await puppeterr.launch({
            headless: false,
            defaultViewports: { width: 1390, height: 844 }

        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0.5 * 60 * 1000)
        await page.goto("https://hostingchecker.com")
        await page.locator('input').fill('https://bluemodoro.vercel.app')
        await page.locator('input.pingsubmit').click();
        const textSelector = await page.waitForSelector(
            'div.hcresults > p > b',
        )
        const fullTitle = await textSelector?.evaluate(el => el.textContent);
        console.log(fullTitle)

    }
    catch (err) {

        console.error('', err)

    }

}

websiteHostingCheck();