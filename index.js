const { URL } = require('url');
const http = require('http');
const { error } = require('console');
const dns = require('dns').promises;
const puppeterr = require("puppeteer");
const cheerio = require('cheerio')

const website = {
    name: "",
    title: "",
    description: "",
    ip_adress: "",
    location: "",
    favicon_url: "",
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



let link = "https://bluemodoro.vercel.app/hello";
let strippedLink;
LinkValidation_LinkParsing();

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
        const result = await dns.lookup(link) // taking ip adresss of domain name
        website.ip_adress = result.address;

        // API call to find ip location https://ipwhois.io
        /*
        const data = await fetch(`http://ipwho.is/${website.ip_adress}`)
        const response = await (data.json())
        website.location = response.country
        */


        console.log(website.ip_adress)
        website.secure = (strippedLink.protocol == "https:") ? website.secure = true : website.secure = false;
        // websiteHostingCheck();


    }
    catch (err) {

        console.error('ERROR ', err)
        website.ip_adress = "not found"
        //   websiteHostingCheck();

    }
}

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
















