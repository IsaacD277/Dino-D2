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

// {
//   "url": "https://dinod2uploads.s3.amazonaws.com/",
//   "fields": {
//     "key": "aec2f45d-22a6-4db3-b059-6e31439e40f5.jpeg",
//     "AWSAccessKeyId": "ASIATZBWR5CG5NZLD6AQ",
//     "x-amz-security-token": "IQoJb3JpZ2luX2VjEIj//////////wEaCXVzLWVhc3QtMSJIMEYCIQCQ+6+GlrrLWpmrN1KRL8/UKEjOQRTaM5juG+dbcF2WCgIhALOZQE7glDjkzAjd1Rz+6yNzi7fK6RRpeHZJVJHMBLMoKvgCCFEQABoMMjU5OTU5OTQxMjYxIgwlgC/4t1UQNHrY3Roq1QJbojCIfpFgocLkVDxLepJZBPX1fYgPWwBaMZSzzBXWHQTRvf6XC7k0owYj2UJ60swzI/CSzxmw8dpRXr1nApevgIppJUQrYljEVHt7f7XCr/QR7kRPwnmiIaeOq93NBsGSfEFFnTe76t4V2ibURI69Xp4bp8NgCsfjHRr/MC9Hwme3yDG+RTLJATZ6o+FCYe/9m0Iq2Kk4bVPzVpARXzxLhAHzbSvZUpu37wY/2nYPGyEG3POU6kcOE8Ne7u0PSzON2zpT7bIG8wHGk4YZ2eRlUel35eV8/xzVxVo2iA/P+17VcdVSsYB0tWRTP5zuRWzLAwdnlUQvf1RkA/OLYie3iBnazMdPbnG2TAzsFISlp+AAlzn1n9QxmZBuh9kTX1ltB0sRmjG03xLFvwlEzP+LU3k9JFgM5Bj+693vd9bdR853AUcX9X4yWArFH0P+Tun6+YuPbzCNgNjIBjqdAW+uE2uy9LK3e/FxA2t2AMsm7gSO5Op92P1TTTv732nOOroip4Zxzt4+Rudlofi12Ngs7WF5BoujNwpsCVxbbvYBjXmyU0qGYZZNLz6zKZaXJSnznaA9x7KNYYBza3ia42Do32gZGnT/cD50G5Ho1hyybEyuBMSlJ6njpRtVuVSzCjMZBsRBz3iL2hFOuWPmkzr2nahUT4K0WMUSG10=",
//     "policy": "eyJleHBpcmF0aW9uIjogIjIwMjUtMTEtMTNUMTY6MDk6MTVaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAiZGlub2QydXBsb2FkcyJ9LCB7ImtleSI6ICJhZWMyZjQ1ZC0yMmE2LTRkYjMtYjA1OS02ZTMxNDM5ZTQwZjUuanBlZyJ9LCB7IngtYW16LXNlY3VyaXR5LXRva2VuIjogIklRb0piM0pwWjJsdVgyVmpFSWovLy8vLy8vLy8vd0VhQ1hWekxXVmhjM1F0TVNKSU1FWUNJUUNRKzYrR2xyckxXcG1yTjFLUkw4L1VLRWpPUVJUYU01anVHK2RiY0YyV0NnSWhBTE9aUUU3Z2xEamt6QWpkMVJ6KzZ5TnppN2ZLNlJScGVIWkpWSkhNQkxNb0t2Z0NDRkVRQUJvTU1qVTVPVFU1T1RReE1qWXhJZ3dsZ0MvNHQxVVFOSHJZM1JvcTFRSmJvakNJZnBGZ29jTGtWRHhMZXBKWkJQWDFmWWdQV3dCYU1aU3p6QlhXSFFUUnZmNlhDN2swb3dZajJVSjYwc3d6SS9DU3p4bXc4ZHBSWHIxbkFwZXZnSXBwSlVRcllsakVWSHQ3ZjdYQ3IvUVI3a1JQd25taUlhZU9xOTNOQnNHU2ZFRkZuVGU3NnQ0VjJpYlVSSTY5WHA0YnA4TmdDc2ZqSFJyL01DOUh3bWUzeURHK1JUTEpBVFo2bytGQ1llLzltMElxMktrNGJWUHpWcEFSWHp4TGhBSHpiU3ZaVXB1Mzd3WS8ybllQR3lFRzNQT1U2a2NPRThOZTd1MFBTek9OMnpwVDdiSUc4d0hHazRZWjJlUmxVZWwzNWVWOC94elZ4Vm8yaUEvUCsxN1ZjZFZTc1lCMHRXUlRQNXp1Uld6TEF3ZG5sVVF2ZjFSa0EvT0xZaWUzaUJuYXpNZFBibkcyVEF6c0ZJU2xwK0FBbHpuMW45UXhtWkJ1aDlrVFgxbHRCMHNSbWpHMDN4TEZ2d2xFelArTFUzazlKRmdNNUJqKzY5M3ZkOWJkUjg1M0FVY1g5WDR5V0FyRkgwUCtUdW42K1l1UGJ6Q05nTmpJQmpxZEFXK3VFMnV5OUxLM2UvRnhBMnQyQU1zbTdnU081T3A5MlAxVFRUdjczMm5PT3JvaXA0Wnh6dDQrUnVkbG9maTEyTmdzN1dGNUJvdWpOd3BzQ1Z4YmJ2WUJqWG15VTBxR1laWk5MejZ6S1phWEpTbnpuYUE5eDdLTllZQnphM2lhNDJEbzMyZ1pHblQvY0Q1MEc1SG8xaHl5YkV5dUJNU2xKNm5qcFJ0VnVWU3pDak1aQnNSQnozaUwyaEZPdVdQbWt6cjJuYWhVVDRLMFdNVVNHMTA9In1dfQ==",
//     "signature": "t9iMrI9KV59jWGwFBntGkSrov9I="
//   }
// }

        // { 
        //     "Sid": "Statement1", 
        //     "Effect": "Allow", 
        //     "Principal": { 
        //         "AWS": "arn:aws:iam::ACCOUNTID:role/ROLE-NAME" }, 
        //         "Action": "sts:AssumeRole" 
        // }

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

        formdata.append("key", responseObject.fields.key);
        formdata.append("AWSAccessKeyId", responseObject.fields["AWSAccessKeyId"]);
        formdata.append("policy", responseObject.fields.policy);
        formdata.append("signature", responseObject.fields.signature);
        // formdata.append("x-amz-security-token", responseObject.fields["x-amz-security-token"]);
        formdata.append("file", image);

        const response = await fetch(responseObject.url, {
            method: "POST",
            // headers: {
            //     "x-amz-security-token": responseObject.fields["x-amz-security-token"]
            // },
            body: formdata
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

        fetch(responseObject, {
            method: 'PUT',
            headers: {
                "Content-Type": image.type
            },
            body: new File([image], image)
        });
        const url = new URL(responseObject);
        console.log(url.hostname + url.pathname);
        const imageLink = "https://" + url.hostname + url.pathname;
        // https://dinod2uploads.s3.amazonaws.com/b479035b-74ce-4cd5-b38e-1a105258d242.jpeg?AWSAccessKeyId=ASIATZBWR5CGQXDFYILJ&Signature=xuZYRkVfHs4pWnUM%2BnPrZEpPMyA%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEI3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQChTztB4rTMWmGN0rct2bwGZLqMG%2BF5NNYOyNP6r%2BsCOwIhAOugfpYpwz6QLGCgXGJUDnT%2FikH9PWfS82XSw7ep5CDrKvgCCFUQABoMMjU5OTU5OTQxMjYxIgwDaJEYedfqrGYXW6oq1QJjrFEAQR3EQsVuH2pq%2BGtjEmb1DDKuJXO6xN9aXKbVdKRRf0zMF54%2FGZS6Ptd1Bg3EzujrVXiNBXXS0N07us9U4Xil5IKAY7exTXgPniQypZ1KciI3pN0bYZPGs%2BTMyZlheVqWtFufFfULUiMCPP7aYQezNwOSW4oRpsel8DsKKF0qMXm1wcTINbtod7OkXst3LtwFudYffcAQp0EFpcFkFUsn2h5eGL%2BrngJJ%2F%2BsWGy3l2OuXw3VS12o22mWJqNSOBeqZ4DBKHJN7RtuxMXiXo4crD7zCPv06u5WB8agIah%2BWVdj8tBFV424nNMjCD1Lw6Dmv3lf%2Fk4qA%2BN4aAJcPAmQKeHCNmjvchbgKjy7dJdLh2N0luB2KC0yt4lQhnLxkbXClUokA05H5K0vw56VjluNPuK0wlhAMBlGHHXYuA2%2BbKYyqkVJisSRJcCsr%2BZE67EsRnTDA9tjIBjqdAXMTg9NW0oX4NguDzQ0a%2FPRcjh3RzIhkjI7kcjOTEKAubSY5Z4xttcmndQOfxIDYqlDHixC7lMJ%2FevxJI40MaoC2H2RT3nl2%2FOtl1pfqtn7h%2BybU7VBjWas23ntvArx8InM144Cacs%2BBQiu%2BGmBT3lcUkK%2BT%2FClYJifuxxkM7oWfBA1eS4Uiyh4vNoqjptNz%2B7Bc6bxx0ldBTGm80Lc%3D&Expires=1763064703

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
    const imageLink = await uploadImage3();
    console.log("Image Link: " + imageLink);
    
    setTimeout(() => {
        window.open(imageLink).focus();
    }, 5000);
});

//#endregion

// curl -X PUT -T "/home/cloudshell-user/Mood_Original.jpg" "https://dinod2uploads.s3.amazonaws.com/14a4004a-c0bc-43d9-98ce-d86b33e53ffc.jpeg?AWSAccessKeyId=ASIATZBWR5CGX7HDLJS2&Signature=nc3jfdgO%2Fopd84ITtxwkJuWYO6A%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEIz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIGA7oGf4Ajb47mSB9%2BYGekDFOwJ1wjjeLBg%2BkgiwHFBMAiEA25fsGCL5o5xELSI2geqNjv2ak6dCGwWwJhfa%2FaJ9ZzUq%2BAIIVRAAGgwyNTk5NTk5NDEyNjEiDOeftdwGGU6P4AuFsSrVAsCfKQOZ9Z97uzufGSbknNwkJjcQNmITVF4ugCo3tzj4mhkiKHHejsgaS1xbC0BnN%2F7Furwf%2FdvbvG6MLUzBdJX12dM9T%2FbaU3LJbYnsbZeFjIyOZN0DfGhjFJvgw8ZyHJRYBq%2FYWOHW2HB6Ylx3OxOVrrNxOkH3wlRQMhvr08RnA5fVN9S%2FyzoBN0nDXZMIgge5mpaqCCLcg%2FMkAK%2BRHct4mEF5IoHJ4jSWWn%2FPr9ikhNOPzlqEqu7DoqFKShY3GYxQRHJgEpioXhWmN2kjh6Zq5jZ14uNJN045nyDOj2bgqryUxfpoiIvz17M3Y6Gli7X8UUrISJQEch0O6%2B7qKMeQ%2FLHxbXH%2F25t09jQBTmBuN78oWGhB3SEHkFXxIIT5DpN6nHU1Su2w6KYhBUdy3BeYu0DMkpZuOlB%2BM4bzrf3Sr6r3lnM9OK%2FCtbRbRIM%2FsOPl9wioMPTy2MgGOp4BSCNGT819UWJUBHwr4yPdRJ1rIeOHT77T%2BKzZiMWUwM9nwezL3yS%2B8uRh7a53BfqI9kPRC05wB1EVnosJw6Y2K4bNnaOEjHmNSThjz0zoEBLavz45y4ClpZLJsbi7MKKR%2F41BXYamhNSt7DSlKaIWZP8opryipZ7a%2FqwRlJTwJWp5SZkNV5vKnh5EmYOluPyjVbToN1%2FmuMeKdcBslog%3D&Expires=1763064483"