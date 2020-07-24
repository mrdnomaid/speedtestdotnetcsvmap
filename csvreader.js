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
        let serverLoc = cols[10];
        let intIP = cols[11];
        let extIP = cols[12];

        if(!lat || !lon) continue;
        
        // ios safari is a sped
        let dateStr = date;
        if(!iOS) {
            let dateObj = new Date(date);
            dateStr = `${getOrdinalNum(dateObj.getDate())} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
       }

        let marker = L.marker([lat, lon],{icon:genIcon(isp)}).addTo(map).bindPopup(`
        <div class="marker-inner">
            <h1 title="Info"><span class="smol" style="padding-left: 0; margin-bottom: 8px;">${type} &bull; ${dateStr}</span> <img src="${ispLogo(isp, true)}"> ${isp.replace('SSID: ', '').replace(/\"/g, '')}</h1>
            <h2 title="Download Speed"><i class="fas fa-fw fa-caret-down"></i> <span class="mono">${parseFloat(downSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((downUsed / 1024) / 1024)}MB used</span></h2>
            <h2 title="Upload Speed"><i class="fas fa-fw fa-caret-up"></i> <span class="mono">${parseFloat(upSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((upUsed / 1024) / 1024)}MB used</span></h2>
            <h2 title="Latency (Ping)"><i class="fas fa-fw fa-table-tennis"></i> <span class="mono">${ping}</span>ms</h2>
            <h2 style="margin-top: 8px;" title="Server">
                <i class="fas fa-fw fa-arrows-alt-h"></i> ${serverLoc.replace(/\"/g, '')}
                <span class="smol">Int IP: <span class="mono">${intIP.replace(/\"/g, '')}</span></span>
                <span class="smol">Ext IP: <span class="mono">${extIP.replace(/\"/g, '')}</span></span>
            </h2>
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
    let url = 'isps/mast.png';
    // let url = 'isps/mast_white.png';
    // if(black) url = 'isps/mast.png';

    isp = isp.toLowerCase();

    if(isp.includes('o2') || isp.includes('telefonica') || isp.includes('tesco') || isp.includes('sky') || isp.includes('truphone')) url = 'isps/cell/o2_border.png';
    if(isp.includes('voda') || isp.includes('voxi')) url = 'isps/cell/voda_border.png';
    if(isp.includes('ee') || isp.includes('orange') || isp.includes('bt') || isp.includes('zevvle')) url = 'isps/cell/ee_border.png';
    if(isp.includes('three') || isp.includes('3') || isp.includes('smarty')) url = 'isps/cell/3_border.png';

    if(isp.includes('ssid')) url = 'isps/wifi.png';
    // if(isp.includes('ssid')) url = 'isps/wifi_white.png';
    // if(isp.includes('ssid') && black) url = 'isps/wifi.png';


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