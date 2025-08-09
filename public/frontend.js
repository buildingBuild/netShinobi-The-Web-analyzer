

const searchButton = document.getElementById("searchbutton")
//const link = document.getElementById("searchBox")
searchButton.addEventListener('click', activateWebsite)

let data;

async function activateWebsite() {

    //console.log(document.getElementById("searchBox").value)
    //console.log("HELOOO")

    try {
        let response = await fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link: document.getElementById("searchBox").value }),
        })
        data = await response.json()
        console.log("this is the returned data")
        console.log(data)
    }

    catch (err) {

        console.log("Website status message:", err.message);



    }
}