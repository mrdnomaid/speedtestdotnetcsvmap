const ipInfoToken = '&token=64b6add5b3440d';
let currentId = '';

async function doIpInfo(markerId, ipAddr) {
    let scriptE = document.createElement('script');
    scriptE.src = `https://ipinfo.io/${ipAddr}?callback=ipInfoCallback${ipInfoToken}`;
    currentId = markerId;
    document.body.append(scriptE);
}

function ipInfoCallback(data) {
    let hostname = data.hostname;
    if(!data.hostname) hostname = 'no hostname';
    
    document.getElementById(`marker-${currentId}-ipinfo`).innerHTML = `
        <br>${hostname}<br>
        ${data.org}<br>
        ${data.postal}, ${data.city}, ${data.region}, ${data.country}<br>
        Data from <a href="https://ipinfo.io/${data.ip}">ipinfo.io</a>
    `;
    
    currentId = '';
}