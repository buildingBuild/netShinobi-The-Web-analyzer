let localLink = "http://localhost:5000"
let deployedLink = ""


const searchButton = document.getElementById("searchbutton")
const progress = document.getElementById("progressCheck")
const cover = document.getElementById("cover")
searchButton.addEventListener('click', activateWebsite)

let running = false;
let pageRun = 0;

async function activateWebsite() {
    if (pageRun >= 1) {
        location.reload();
    }
    if (running) {
        return;
    }

    running = true;
    progress.textContent = "Searching...."

    try {
        let response = await fetch(`${localLink}/analyze?userlink=${document.getElementById("searchBox").value}`)
        console.log(response)
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unknown error');
        }

        console.log(data);

        document.getElementById("domainName").textContent = data.name
        document.getElementById("status").textContent = "Website online: " + data.online
        document.getElementById("secure").textContent = "Website Secure: " + data.secure
        document.getElementById("ai").textContent = data.AI_Overview
        document.getElementById("Location").textContent = "Location: " + data.location
        if (data.techstack.length == 0) {
            const newdiv = document.createElement('div')
            newdiv.setAttribute('class', 'f-content')
            newdiv.textContent = "No front-end detected"
            document.getElementById("front-end").append(newdiv)
        }
        else {
            data.techstack.forEach(element => {
                const newdiv = document.createElement('div')
                newdiv.setAttribute('class', 'f-content')
                newdiv.textContent = element
                document.getElementById("front-end").append(newdiv)


            });
        }

        if (data.back_end_stack.length == 0) {
            const newdiv = document.createElement('div')
            newdiv.setAttribute('class', 'f-content')
            newdiv.textContent = "No back-end detected due to cloudfare proxy"
            document.getElementById("back-end").append(newdiv)
        } else {
            data.back_end_stack.forEach(element => {
                const newdiv = document.createElement('div')
                newdiv.setAttribute('class', 'f-content')
                newdiv.textContent = element
                document.getElementById("back-end").append(newdiv)
            })
        }

        data.colorScheme.forEach(element => {
            const newdiv = document.createElement('div')
            newdiv.setAttribute('class', 'd-content')
            newdiv.textContent = element.name + "-" + element.code
            document.getElementById("color-box").append(newdiv)


        })

        data.fonts.forEach(element => {
            const newdiv = document.createElement('div')
            newdiv.setAttribute('class', 'd-content')
            newdiv.textContent = element
            document.getElementById("font-box").append(newdiv)



        })



        const phone = document.getElementById("phone")
        const laptop = document.getElementById("laptop")

        phone.setAttribute('src', '/img_icons/mobileView.png')
        laptop.setAttribute('src', '/img_icons/LaptopView.png')

        document.getElementById("ip").textContent = "IP Address: " + data.ip_adress

        data.hostingProvider.forEach(element => {

            document.getElementById("host").textContent += element

        })






        progress.textContent = "Success!";
        cover.classList.add("animate")
        cover.style.display = 'flex'

    } catch (err) {
        console.log("Website status message:", err.message);
        if (err.message == "Failed to fetch" || "fetch failed") {
            progress.textContent = "Website does not exist/not authorized"
        } else {
            progress.textContent = err.message;
        }
    } finally {
        running = false;
        ++pageRun


    }
}