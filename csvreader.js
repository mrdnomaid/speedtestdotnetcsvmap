function readCsv(csv) {
    s('processing file');

    let rows = csv.split('\n');

    // if(clustered) {
        // let markers = L.markerClusterGroup({
        //     showCoverageOnHover: false,
        //     iconCreateFunction: function(cluster) {
        //         return L.divIcon({ html: '<div class="marker-cluster">' + cluster.getChildCount() + '</div>' });
        //     }
        // });
    // } else {
        let markers = [];
    // }

    let i = -1;
    for(let row of rows) {
        i++;
        if(i == 0) continue;

        let cols = row.split(',');
        if(cols.length == 0) continue;

        let date = cols[0];
        let type = cols[1];
        let isp = cols[2];
        let lat = cols[3];
        let lon = cols[4];
        let downSpeed = cols[5];
        let downUsed = cols[6]; // in bytes
        let upSpeed = cols[7];
        let upUsed = cols[8]; // in bytes
        let ping = cols[9];

        if(!lat || !lon) continue;
        
        // ios safari is a sped
        if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) { // https://stackoverflow.com/a/9039885
            let dateStr = date.toString();
        } else {
            let dateObj = new Date(date);
            let dateStr = `${getOrdinalNum(dateObj.getDate())} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
        }

        let marker = L.marker([lat, lon],{icon:genIcon(isp)}).addTo(map).bindPopup(`
        <div class="marker-inner">
            <h1><img src="${ispLogo(isp, true)}"> ${isp.replace('SSID: ', '').replace(/\"/g, '')} <span class="smol" style="padding-left: 0;">${type}</span></h1>
            <h2><i class="fas fa-fw fa-caret-down"></i> <span class="mono">${parseFloat(downSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((downUsed / 1024) / 1024)}MB used</span></h2>
            <h2><i class="fas fa-fw fa-caret-up"></i> <span class="mono">${parseFloat(upSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((upUsed / 1024) / 1024)}MB used</span></h2>
            <h2><i class="fas fa-fw fa-table-tennis"></i> <span class="mono">${ping}</span>ms</h2>
            <h3 style="margin-top: 8px;"><i class="fas fa-fw fa-calendar-day"></i> ${dateStr}</h3>
        </div>
        `);

        // if(clustered) {
            // markers.addLayer(marker);
        // } else {
            markers.push(marker);
        // }

    } 

    // if(clustered) {
        // map.addLayer(markers);
    // } else {
        let markerGroup = new L.featureGroup(markers);
        map.fitBounds(markerGroup.getBounds());
    // }

    s('done, refresh to use a different file');
    // document.getElementById('header').style.display = 'none';
}



function ispLogo(isp, black) {
    let url = 'isps/mast_white.png';
    if(black) url = 'isps/mast.png';

    isp = isp.toLowerCase();

    if(isp.includes('o2') || isp.includes('telefonica') || isp.includes('tesco') || isp.includes('sky')) url = 'isps/cell/o2_border.png';
    if(isp.includes('voda') || isp.includes('voxi')) url = 'isps/cell/voda_border.png';
    if(isp.includes('ee') || isp.includes('orange') || isp.includes('bt')) url = 'isps/cell/ee_border.png';
    if(isp.includes('three') || isp.includes('3') || isp.includes('smarty')) url = 'isps/cell/3_border.png';

    if(isp.includes('ssid')) url = 'isps/wifi_white.png';
    if(isp.includes('ssid') && black) url = 'isps/wifi.png';


    return url;
}

function genIcon(isp) {
    let url = ispLogo(isp);

    return L.icon({
        iconUrl: `${url}`,
        iconRetinaUrl: `${url}`,
        iconSize: [20, 20],
        popupAnchor: [0, -5],
    });
}

// https://stackoverflow.com/a/44418732
function getOrdinalNum(n) {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}