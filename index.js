const { URL } = require('url');
const http = require('http');
const { error } = require('console');
const dns = require('dns').promises;

const website = {
    name: "",
    description: "",
    ip_adress: "",
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



let link = "htts://bluemodoro.vercel.com";

LinkValidation_LinkParsing();

async function LinkValidation_LinkParsing() {
    try {
        let strippedLink = new URL(link)
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
    try {
        let websiteResponse = await fetch(link)
        console.log(websiteResponse)

        if (websiteResponse.status == '200') {
            website.online = true;
            linkFormattingAndipAdress();
        }
        else {
            throw new Error("Website access Unauthorized/Does not exist")
        }

    }
    catch (err) {
        console.log('', err)
        return;

    }

}


async function linkFormattingAndipAdress() {
    try {

        // const result = await dns.lookup()

    }
    catch (err) {


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