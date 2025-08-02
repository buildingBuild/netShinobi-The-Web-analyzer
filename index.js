const { URL } = require('url');
const http = require('http');
const { error } = require('console');
const dns = require('dns').promises;
const puppeteer = require("puppeteer");
const cheerio = require('cheerio')
const OpenAI = require("openai")

const openai = new OpenAI({

    apiKey: process.env.API_KEY

});



const website = {
    name: "",
    title: "",
    description: "",
    ip_adress: "",
    location: "",
    favicon_url: "",
    css_url: "",
    online: false,
    tld: "", // Top-Level Domain Last part of it
    secure: false,
    techstack: [],
    colorScheme: [],
    fonts: [],
    contactName: " ",
    contactAdress: "",
    fullLink: "",
    hostingProvider: []

}



let link = "https://flexboxfroggy.com";
let strippedLink;
//LinkValidation_LinkParsing();
detectFrameworks_takePictures()

async function LinkValidation_LinkParsing() {
    try {
        strippedLink = new URL(link)
        console.log(strippedLink)
        if (strippedLink == null) {
            throw new Error("Link not valid")
        }
        else if (strippedLink.protocol !== "https:" && "http:") {

            throw new Error("Link is not formatted properly")

        }
        else {
            console.log('Correct');
            website.name = strippedLink.hostname

            let tld = strippedLink.host.slice(strippedLink.host.length - 4, strippedLink.host.length)
            website.tld = tld;
            website.fullLink = strippedLink.href
            // console.log("Host Name is: " + website.name)

            checkWebsiteExists_andOnline();

        }
    }
    catch (err) {
        console.error('', err)
        return;

    }

}

async function checkWebsiteExists_andOnline() {
    let websiteResponse
    try {
        websiteResponse = await fetch(link) // checking if the website is online 
        console.log(websiteResponse)

        if (websiteResponse.status == '200') {
            website.online = true;
            checkWebsiteSecurityAndipAdress();
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

async function checkWebsiteSecurityAndipAdress() {
    try {
        console.log("Here")
        const result = await dns.lookup(website.name) // taking ip adresss of domain name
        website.ip_adress = result.address;

        // API call to find ip location https://ipwhois.io
        /*
        const data = await fetch(`http://ipwho.is/${website.ip_adress}`)
        const response = await (data.json())
        website.location = response.country
        */


        console.log(website.ip_adress)
        website.secure = (strippedLink.protocol == "https:") ? website.secure = true : website.secure = false;
        websiteHostingCheck();


    }
    catch (err) {

        console.error('ERROR', err)
        website.ip_adress = "not found"
        websiteHostingCheck();

    }
}

async function websiteHostingCheck() {
    getDescription_title_favicon();
    return;
    try {


        const browser = await puppeteer.launch({
            headless: true,
            defaultViewports: { width: 1390, height: 844 }

        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0.5 * 60 * 1000)
        await page.goto("https://hostingchecker.com")
        await page.locator('input').fill(link)
        await page.locator('input.pingsubmit').click();
        const textSelector = await page.waitForSelector(
            'div.hcresults > p > b',
        )
        const fullTitle = await textSelector?.evaluate(el => el.textContent);
        console.log(fullTitle)
        website.hostingProvider.push(fullTitle)
        await browser.close();
        getDescription_title_favicon();

    }
    catch (err) {

        console.error('', err)
        website.hostingProvider.push("None Found");
        getDescription_title_favicon();

    }

}





async function getDescription_title_favicon() {
    try {


        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1390, height: 844 }

        });


        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(3 * 60 * 1000)
        await page.goto(link)

        const title = await page.title();
        website.title = title || "N/A";



        const description = await page.evaluate(() => {
            const metas = document.querySelectorAll('meta');
            const descTag = Array.from(metas).find(m => m.getAttribute('name') === 'description');
            if (descTag) {
                return descTag.getAttribute('content');
            } else {
                return "N/A";
            }
        });

        website.description = description;

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
        website.favicon_url = favicon_url


        const css_url = await page.evaluate(() => {
            const links = document.querySelectorAll('link')
            const styleSheet = Array.from(links).find((s) => {

                return s.getAttribute('rel') === 'stylesheet'

            })
            if (styleSheet) {
                return styleSheet.getAttribute('href')
            } else {
                return "N/A"
            }
        })

        website.css_url = css_url



        console.log(description)
        console.log(favicon_url)
        console.log(css_url)
        detectFrameworks_takePictures()
    }


    catch (err) {
        website.css_url = "N/A"
        console.error('', err)

        detectFrameworks_takePictures()





    }
}

async function detectFrameworks_takePictures() {

    try {

        const browser = await puppeteer.launch({
            headless: true,
            // defaultViewport: { width: 1390, height: 844 }

        });


        const page = await browser.newPage();
        const page2 = await browser.newPage() // open for laptop screen

        await page.setViewport({ width: 393, height: 852 })
        await page2.setViewport({ width: 1280, height: 832 })


        page.setDefaultNavigationTimeout(3 * 60 * 1000)
        page2.setDefaultNavigationTimeout(3 * 60 * 1000)
        await page.goto(link, { waitUntil: 'domcontentloaded' })
        await page2.goto(link, { waitUntil: 'domcontentloaded' })
        await page.screenshot({

            path: `${website.name}_mobileView.png`,
            fullPage: true
        })
        await page2.screenshot({ path: `${website.name}_LaptopView.png`, fullPage: true })

        const allScriptTexts = await page.evaluate(() => {

            const linksContent = document.querySelectorAll('script')
            const scriptSources = Array.from(linksContent).map((s) => {

                const link = s.getAttribute('src')

                if (link !== null && link.startsWith('js')) {
                    return link
                }
                else {
                    return null
                }
            }).filter(Boolean)

            return scriptSources;


        })
        console.log(allScriptTexts)





        await browser.close();

    }
    catch {


        console.error('ERROR', err)


    }

}

async function AIoverview() {

    try {
        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            input: "This is a test return 3",
            store: true,
        });

        const result = await response.output_text
        console.log(result)


    }
    catch (err) {

        console.error('', err)
    }







}

















