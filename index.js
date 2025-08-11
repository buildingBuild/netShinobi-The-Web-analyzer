const { URL } = require('url');
const http = require('http');
const { error } = require('console');
const dns = require('dns').promises;
const puppeteer = require("puppeteer");
const cheerio = require('cheerio')
const OpenAI = require("openai");
const { json } = require('express');
const fs = require('fs')
const mongoose = require('mongoose')
const Web = require('./website.js')
const express = require('express')
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'))


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Running"))

app.get('/get', (req, res) => {

    console.log("it works")

})

let link = "";
let strippedLink;
let userIp = ""

app.post('/analyze', async (req, res) => {
    try {
        // userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        //   console.log("My ip is")


        link = req.body.link
        const frontEndData = await LinkValidation_LinkParsing();
        res.json(website)
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }

})
const connectionString = process.env.DATABASE_STRING;



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
    back_end_stack: [],
    colorScheme: [],
    fonts: [],
    contactName: " ",
    contactAdress: "",
    fullLink: "",
    hostingProvider: [],
    AI_Overview: "",
    user_ip: ""

}




async function LinkValidation_LinkParsing() {
    connectToDatabase();
    try {
        strippedLink = new URL(link)
        // console.log(strippedLink)
        if (strippedLink == null) {
            throw new Error("Link not valid")
        }
        else if (strippedLink.protocol !== "https:" && "http:") {

            throw new Error("Link is not formatted properly")

        }
        else {
            // console.log('Correct');
            website.name = strippedLink.hostname

            let tld = strippedLink.host.slice(strippedLink.host.length - 4, strippedLink.host.length)
            website.tld = tld;
            website.fullLink = strippedLink.href
            // console.log("Host Name is: " + website.name)

            await checkWebsiteExists_andOnline();
            return website

        }
    }
    catch (err) {
        throw err
        // return "Error " + err

    }

}

async function checkWebsiteExists_andOnline() {
    let websiteResponse
    try {
        websiteResponse = await fetch(link) // checking if the website is online 

        if (websiteResponse.status == '200') {
            website.online = true;
            await checkWebsiteSecurityAndipAdress();
        }
        else {
            throw new Error()
        }
    }
    catch (err) {

        throw err
        //return "Website " + (websiteResponse?.statusText || "Error");

    }

}

async function checkWebsiteSecurityAndipAdress() {
    try {
        website.user_ip = userIp;
        console.log("MY ip add is" + website.user_ip)

        console.log("Here")
        const result = await dns.lookup(website.name) // taking ip adresss of domain name
        website.ip_adress = result.address;

        // API call to find ip location https://ipwhois.io

        const data = await fetch(`http://ipwho.is/${website.ip_adress}`)
        const response = await (data.json())
        website.location = response.country



        // console.log(website.ip_adress)
        website.secure = (strippedLink.protocol == "https:") ? website.secure = true : website.secure = false;
        await websiteHostingCheck();


    }
    catch (err) {

        console.error('ERROR', err)
        website.ip_adress = "not found"
        await websiteHostingCheck();

    }
}

async function websiteHostingCheck() {

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
        await getDescription_title_favicon();

    }
    catch (err) {

        console.error('', err)
        website.hostingProvider.push("None Found");
        await getDescription_title_favicon();

    }

}





async function getDescription_title_favicon() {
    try {


        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1390, height: 844 },
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] // to stop render from blocking


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
        await detectFrameworks_takePictures()
    }


    catch (err) {
        website.css_url = "N/A"
        console.error('', err)

        await detectFrameworks_takePictures()





    }
}

async function detectFrameworks_takePictures() {
    // Dangerous code here making multiple request that quickly could get it blocked
    // Debug this section specifically in future if errors as such start to occur 

    // Cheerio Launch
    const response = await fetch(link)
    const websiteData = await response.text();
    const $ = await cheerio.load(websiteData);



    let cookies = response.headers.get('set-cookie') // to detect backend frameworks
    // this is the response data that hints at backends






    const websiteContinua = websiteData.replace(/\s/g, "") // Global DOM string 



    // Puppet Launch 
    const browser = await puppeteer.launch({
        headless: true,

    });
    let page = await browser.newPage();
    let page2 = await browser.newPage() // open for laptop screen


    try {
        // Taking Pictures of screen 
        await page.setViewport({ width: 393, height: 852 })
        await page2.setViewport({ width: 1280, height: 832 })


        page.setDefaultNavigationTimeout(3 * 60 * 1000)
        page2.setDefaultNavigationTimeout(3 * 60 * 1000)

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36");
        await page.setJavaScriptEnabled(true);
        await page.goto(link, { waitUntil: "networkidle2" });

        await page2.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36");
        await page2.setJavaScriptEnabled(true);
        await page2.goto(link, { waitUntil: "networkidle2" });

        const phoneimgPath = path.join(__dirname, 'public', 'img_icons', 'mobileView.png');
        const LaptopimgPath = path.join(__dirname, 'public', 'img_icons', 'LaptopView.png');
        await page.screenshot({

            path: phoneimgPath,
            fullPage: true
        })
        await page2.screenshot({ path: LaptopimgPath, fullPage: true })
    }
    catch (err) {
        console.error('ERROR', err)
    }

    try {

        // Detecting CSS Frameworks , Tailwind & Bootstrap & Bulma

        let tailwind_exist = false;
        // console.log(websiteContinua)

        let tailwindCounter = 0;
        const tailwindHints = ["flex", "hidden", "mt-", "text-", "bg-", "w-full", "h-screen", "mt-", "mb-", "p-", "gap-4"];

        tailwindHints.forEach((hint) => {
            if (websiteContinua.includes(hint)) {
                ++tailwindCounter;
            }
        })

        if (tailwindCounter >= 4) {
            tailwind_exist = true;
            website.techstack.push("tailwind.css")
            console.log("STRONG TAILWIND DETECTION ")
        }

        let bootStrap_exists = false;
        if (websiteContinua.includes("bootstrap")) {
            bootStrap_exists = true;
            website.techstack.push("Bootstrap.css")
            console.log("BOOTSTRAP DETECTED ")
        }


        let bulma_exists = false;
        if (websiteContinua.includes("bulma")) {
            bulma_exists = true
            website.techstack.push("Bulma.css")
            console.log("Bulma Detected ")
        }

        // Detecting JS Front-end frameworks


        let nextJs_exists = false;
        let ReactJs_exists = false;

        if (websiteContinua.includes("_next") || websiteContinua.includes("__next")) {
            console.log("NEXTJS detected")
            console.log("REACTJS detected")
            nextJs_exists = true;
            ReactJs_exists = true;
            website.techstack.push("Next.js")
            website.techstack.push("React.js")
        }



        if (!ReactJs_exists) {
            const ReactHints = ['id="root"', "data-reactroot"];
            ReactHints.some((hint) => {
                if (websiteContinua.includes(hint)) {
                    ReactJs_exists = true;
                    website.techstack.push("React.js")
                    console.log("React Detected")
                }
            })

        }

        let AngularJs_exists = false;
        if (websiteContinua.includes("ng-") || websiteContinua.includes("*ngIf")) {
            AngularJs_exists = true;
            website.techstack.push("Angular.js")
            console.log("Angular Detected")
        }

        let svelte_exist = false;
        if (websiteContinua.includes("Svelte")) {
            svelte_exist = true;
            website.techstack.push("svelte")
            console.log("Svelete Detected")

        }


        let vueCounter = 0;
        const vueJsHints = ["v-if", "v-for", "v-model", "v-bind", "v-on", "v-", "vue"]
        vueJsHints.forEach((hint) => {
            if (websiteContinua.includes(hint)) {
                ++vueCounter;
            }
        })
        if (vueCounter >= 2) {
            console.log("Vue Detected")
            website.techstack.push("Vue.js")

        }


        // Detecting Back-end Frameworks


        if (cookies.includes("laravel_session") || cookies.includes("XSRF-TOKEN")) {
            website.back_end_stack.push("laravel")
            console.log("LARAVEL DETECTED")
        }

        if (cookies.includes("sessionid") || cookies.includes("csrftoken")) {
            website.back_end_stack.push("Django")
            console.log("DJANGO DETECTED")
        }

        if (cookies.includes("express.sid") || cookies.includes("connect.sid")) {
            website.back_end_stack.push("Express")
            console.log("EXPRESS DETECTED")
        }

        if (cookies.includes("JSESSIONID") || cookies.includes("spring")) {
            website.back_end_stack.push("Spring")
            console.log("SPRING DETECTED")
        }

        if (cookies.includes("ASP.NET")) {
            website.back_end_stack.push("Asp.net")
            console.log("ASP.NET DETECTED")
        }

        await browser.close();
        await getDesignElements();







    }
    catch (err) {
        console.error('', err)
        await browser.close();
        await getDesignElements();

    }



}

async function getDesignElements() {

    try {
        const LaptopimgPath = path.join(__dirname, 'public', 'img_icons', 'LaptopView.png');

        if (fs.existsSync(LaptopimgPath)) {
            const imageBuffer = fs.readFileSync(LaptopimgPath);
            const imageAsBase64 = imageBuffer.toString('base64');
            console.log('FILE EXISTS')


            const response = await openai.responses.create({
                model: "gpt-4.1-mini",
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: "Identify 3-5 key fonts used in the image. Also extract the main color scheme, listing each color with both its name. Return a raw JSON string only—no backticks, formatting, or extra explanation. Use the keys fonts and colors. The object colors should have keys of name and code"

                            },
                            {
                                type: "input_image",
                                image_url: `data:image/jpeg;base64,${imageAsBase64}`,
                            },
                        ],
                    },
                ],
            });

            console.log(response.output_text)

            const designElements = await JSON.parse(response.output_text)


            designElements.fonts.forEach((s) => {
                s = String(s);
                if (s !== "undefined") {
                    website.fonts.push(s)
                }
            })

            designElements.colors.forEach((s) => {
                if (s && s.name && s.code) {
                    website.colorScheme.push({
                        name: s.name,
                        code: s.code
                    });
                }
            })
        }

        await AIoverview_saveToDataBase();
    }
    catch (err) {
        console.error('', err)
        await AIoverview_saveToDataBase();
    }

}

async function AIoverview_saveToDataBase() {


    const subWebsite = {
        name: website.name,
        title: website.title,
        description: website.description,
        ip_location: website.ip_location,
        top_level_domain: website.tld,
        techstack: website.techstack
    }

    // console.log(subWebsite)


    try {
        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            input: `Return a concise summary of the website object make it friendly. Take into consideration its tld  e.g ___ is a commercial site hosted in the United States. It's built with Node.js, Express, and MongoDB. ${JSON.stringify(subWebsite)}`,
            store: true,
        });

        const result = await response.output_text
        console.log(result)
        website.AI_Overview = result


    }
    catch (err) {

        console.error('', err)
    }


    try {

        const web = new Web({
            name: website.name,
            title: website.title,
            description: website.description,
            ip_adress: website.ip_adress,
            location: website.location,
            favicon_url: website.favicon_url,
            css_url: website.css_url,
            online: website.online,
            tld: website.tld,
            secure: website.secure,
            techstack: website.techstack,
            back_end_stack: website.back_end_stack,
            colorScheme: website.colorScheme,
            fonts: website.fonts,
            contactName: website.contactName,
            contactAdress: website.contactAdress,
            fullLink: website.fullLink,
            hostingProvider: website.hostingProvider,
            AI_Overview: website.AI_Overview,
            user_ip: website.user_ip
        });
        const result = await web.save();
        console.log(result)



    } catch (err) {
        console.error('err', err)
    }


}

async function connectToDatabase() {
    try {
        const result = await mongoose.connect(connectionString)
        console.log("Connected")
    }
    catch (err) {
        console.error('THERE IS BIG ERROR', err)
    }


}

