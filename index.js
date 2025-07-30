const { URL } = require('url'); // To parse my url strings
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



let link = "https://www.google.com";




async function websiteExists_andOnline() {
    try {
        let websiteResponse = await fetch(link)
        console.log(websiteResponse)

        if (website.status == '200') {
            website.online = true;
        }
        else {
            throw new Error("Website access Unauthorized/offline")
        }

    }
    catch (err) {
        console.log('Error', err)

    }

}


async function linkFormattingAndipAdress() {
    try {
        let strippedLink = URL.parse(link)
        console.log(strippedLink)
        const result = await dns.lookup()

    }
    catch (err) {


    }


}

websiteExists_andOnline();


















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