const { URL } = require('url');
const http = require('http');
const { error } = require('console');
const dns = require('dns').promises;

const website = {
    name: "",
    description: "",
    ip_adress: "",
    location: "",
    favicon_url: "",
    online: false,
    tld: "", // Top-Level Domain Last parr of it
    secure: false,
    techstack: [],
    colorScheme: [],
    fonts: [],
    contactName: " ",
    contactAdress: "",
    fullLink: ""

}



let link = "https://bluemodoro.vercel.app";
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
        websiteResponse = await fetch(link)
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

        const result = await dns.lookup(link)
        website.ip_adress = result.address;

        // API call to find ip location https://ipwhois.io
        /*
        const data = await fetch(`http://ipwho.is/${website.ip_adress}`)
        const response = await (data.json())
        website.location = response.country
        */

        console.log(website.ip_adress)
        website.secure = (strippedLink.protocol == "https:") ? website.secure = true : website.secure = false;

    }
    catch (err) {

        console.error('ERROR ', err)
        website.ip_adress = "not found"

    }


}





//websiteExists_andOnline()














/*



// Look up a domain name
dns.lookup('hahahahahhaaaaa.com', (err, address, family) => {
    if (err) {
        console.error('Lookup error:', err);
        return;
    }
    console.log(`IP address: ${address}`);
    console.log(`IP version: IPv${family}`);
});

*/