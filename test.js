const { error } = require('console');

const cheerio = require('cheerio');
const puppeteer = require("puppeteer");


async function getWebsiteDescription_contactInfo_favicon() {

    try {
        const response = await fetch("https://cheerio.js.org")
        const data = await response.text();
        // console.log(data)

        const $ = await cheerio.load(data)

        $('meta').each((i, el) => {
            if ($(el).attr('name') === 'description') {
                console.log($(el).attr('content'));
            }
        });

        $('link').each((i, el) => {
            if ($(el).attr('rel') === 'icon') {
                console.log($(el).attr('href'));
            }
        })

    }
    catch (err) {

        console.error('', err)

    }


}




async function getDescription_title_favicon() {
    try {


        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1390, height: 844 }

        });


        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0.5 * 60 * 1000)
        await page.goto("https://cheerio.js.org")

        const title = await page.title();
        //website.title = title || "N/A";
        console.log(title)


        const description = await page.evaluate(() => {
            const metas = document.querySelectorAll('meta');
            const descTag = Array.from(metas).find(m => m.getAttribute('name') === 'description');
            if (descTag) {
                return descTag.getAttribute('content');
            } else {
                return "N/A";
            }
        });

        const favicon_url = await page.evaluate(() => {

            const links = document.querySelectorAll('link')
            const favicon = Array.from(links).find((l) => {
                return l.getAttribute('rel') === 'icon'

            })
            if (favicon) {
                return favicon.getAttribute('href')
            }
            else {
                return "N/A"
            }
        })

        console.log(description)
        console.log(favicon_url)
    }


    catch (err) {





    }
}


async function checkWebsiteExists_andOnline() {
    let websiteResponse
    try {
        websiteResponse = await fetch("https://cloudconvert.com/apis/html-to-pdf") // checking if the website is online 
        console.log(websiteResponse)

        if (websiteResponse.status == '200') {
            website.online = true;

        }
        else {
            throw new Error()
        }
    }
    catch (err) {
        console.log("Website " + websiteResponse.statusText)
        return;

    }

}

checkWebsiteExists_andOnline()