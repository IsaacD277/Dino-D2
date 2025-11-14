//#region INITIALIZE
let token = null;
let authRetried = false;
let responseObject = null;

//#endregion

//#region FUNCTIONS
async function getURL() {
    try {
        const response = await fetch(`https://api.dinod2.com/development/upload`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const theUrl = await response.json();
            console.log(theUrl);
            return theUrl
        }
    } catch (error) {
        console.error("Error fetching signed URL:", error);
        return null;
    }
}

async function uploadImage() {
    try {
        const fileInput = document.getElementById('fileInput');
        let image = null;
        if (fileInput.files.length > 0) {
            image = fileInput.files[0];
            console.log("Image Type: " + image.type);
        } else {
            throw new Error("There was no image selected");
        }

        responseObject = await getURL();

        console.log("Uploading to: " + responseObject.url);

        const formdata = new FormData();

        formdata.append("Content-Type", image.type);
        formdata.append("key", responseObject.fields.key);
        formdata.append("AWSAccessKeyId", responseObject.fields.AWSAccessKeyId);
        formdata.append("policy", responseObject.fields.policy);
        formdata.append("signature", responseObject.fields.signature);
        formdata.append("file", image);

        const response = await fetch(responseObject.url, {
            method: "POST",
            body: formdata
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const result = await response;
            console.log(result);
            const imageLink = responseObject.url + responseObject.fields.key;

            return imageLink;
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        return null
    }
}

async function uploadImage2() {
    try {
        const fileInput = document.getElementById('fileInput');
        let image = null;
        if (fileInput.files.length > 0) {
            image = fileInput.files[0];
            console.log("Image Type: " + image.type);
        } else {
            throw new Error("There was no image selected");
        }

        responseObject = await getURL();

        console.log("Uploading to: " + responseObject);

        const response = await fetch(responseObject, {
            method: "PUT",
            headers: {
                "Content-Type": image.type
            },
            body: image
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const result = await response.json();
            console.log(result);
            return null
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        return null
    }
}

async function uploadImage3() {
    try {
        responseObject = await getURL();
        const fileInput = document.getElementById('fileInput');
        let image = null;
        if (fileInput.files.length > 0) {
            image = fileInput.files[0];
            console.log("Image Type: " + image.type);
        } else {
            throw new Error("There was no image selected");
        }

        await fetch(responseObject, {
            method: 'PUT',
            headers: {
                "Content-Type": image.type
            },
            body: new File([image], image)
        });
        const url = new URL(responseObject);
        console.log(url.hostname + url.pathname);
        const imageLink = "https://" + url.hostname + url.pathname;

        return imageLink;
    } catch (err) {
        console.error("Error uploading image:", err);
        return null
    }
}

//#endregion

//#region EVENT LISTENERS
window.addEventListener("authReady", async (e) => {
    const loggedIn = e.detail.valid;
    if (loggedIn) {
        token = localStorage.getItem("id_token");
        if (!token) {
            console.warn("No id_token found after auth ready.");
            return null;
        }
        getAPIMode();
    }
});

//#endregion

//#region BUTTONS
document.getElementById("getURL").addEventListener("click", async () => {
    responseObject = await getURL();
});

document.getElementById("uploadImage").addEventListener("click", async () => {
    const imageLink = await uploadImage();
    console.log("Image Link: " + imageLink);
    
    if (imageLink) {
        setTimeout(() => {
            window.open(imageLink).focus();
        }, 5000);
    }
});

//#endregion