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

    let averageSpeeds = {};

    document.getElementById('js-averages').innerHTML = '';
    let averageTableHTML  = `
        <thead>
            <tr>
                <th>ISP &amp; Conn Type</th>
                <th>Avg Dwn</th>
                <th>Avg Up</th>
            </tr>
        </thead>
        <tbody>
    `;

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

        let transit = false;
        if(isp.toLowerCase().includes('ssid')) {
            let ispLowerCase = isp.toLowerCase();
            if(
                ispLowerCase.includes('train')
                || ispLowerCase.includes('bus') // nx busses
                || ispLowerCase.includes('loop') // london midland/west mids trains
                || ispLowerCase.includes('avanti') // avanti west coast
                || ispLowerCase.includes('atw') // arriva trains wales
                || ispLowerCase.includes('transport') // transport for wales/xyz
                || ispLowerCase.includes('national') // nx coaches
                || ispLowerCase.includes('first') // first in certain regions
                || ispLowerCase.includes('arriva') // arriva sapphire
                || ispLowerCase.includes('stagecoach') // stagecoach gold
                || ispLowerCase.includes('chiltern') // chiltern railways
                || ispLowerCase.includes('grand') // grand central trains
                || ispLowerCase.includes('southern') // southern trains
                || ispLowerCase.includes('lner') // london northeastern railway
                || ispLowerCase.includes('gwr') // great western railway
                || ispLowerCase.includes('rail') // scotrail/xyzrail
            ) {
                transit = true;
                type = 'On-Vehicle Wi-Fi';
            }
        }
        
        // ios safari is a sped
        let dateStr = date;
        if(!iOS) {
            let dateObj = new Date(date);
            dateStr = `${getOrdinalNum(dateObj.getDate())} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
        }

        let randID = Math.floor(Math.random() * 99999999) + 1;

        let marker = L.marker([lat, lon],{icon:genIcon(isp,transit)}).addTo(map).bindPopup(`
        <div class="marker-inner" id="marker-${randID}">
            <h1 title="Info"><span class="smol" style="padding-left: 0; margin-bottom: 8px;">${type} &bull; ${dateStr}</span> <img src="${ispLogo(isp, true, transit)}" onload="doIpInfo('${randID}', '${extIP.replace(/\"/g, '')}')"> ${isp.replace('SSID: ', '').replace(/\"/g, '')}</h1>
            <h2 title="Download Speed"><i class="fas fa-fw fa-caret-down"></i> <span class="mono">${parseFloat(downSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((downUsed / 1024) / 1024)}MB used</span></h2>
            <h2 title="Upload Speed"><i class="fas fa-fw fa-caret-up"></i> <span class="mono">${parseFloat(upSpeed / 1000).toFixed(2)}</span>Mbps <span class="smol">${parseInt((upUsed / 1024) / 1024)}MB used</span></h2>
            <h2 title="Latency (Ping)"><i class="fas fa-fw fa-table-tennis"></i> <span class="mono">${ping}</span>ms</h2>
            <h2 style="margin-top: 8px;" title="Server">
                <i class="fas fa-fw fa-arrows-alt-h"></i> ${serverLoc.replace(/\"/g, '')}
                <span class="smol">Int IP: <span class="mono">${intIP.replace(/\"/g, '')}</span></span>
                <span class="smol">
                Ext IP: <span class="mono">${extIP.replace(/\"/g, '')}</span>
                    <span id="marker-${randID}-ipinfo" class="marker-ipinfo"></span>
                </span>
            </h2>
        </div>
        `);

        // if(clustered) {
            // markers.addLayer(marker);
        // } else {
            markers.push(marker);
        // }

        isp = isp.replace(/\"/g, '');        

        if(isp.length > 1) {
            if(averageSpeeds[isp]) {
                averageSpeeds[isp]['down'] += parseFloat(downSpeed);
                averageSpeeds[isp]['up'] += parseFloat(upSpeed);
                averageSpeeds[isp]['count']++;
            } else {
                averageSpeeds[isp] = {};
                averageSpeeds[isp]['down'] = parseFloat(downSpeed);
                averageSpeeds[isp]['up'] = parseFloat(upSpeed);
                averageSpeeds[isp]['count'] = 1;

                if(transit) { averageSpeeds[isp]['transit'] = true } else { averageSpeeds[isp]['transit'] = false };
            }
        }
    } 

    // if(clustered) {
        // map.addLayer(markers);
    // } else {
        let markerGroup = new L.featureGroup(markers);
        map.fitBounds(markerGroup.getBounds());
    // }

    let sortableAverage = [];
    for(let isp in averageSpeeds) {
        sortableAverage.push({
            'name': isp,
            'down': parseFloat((averageSpeeds[isp].down / averageSpeeds[isp].count) / 1000).toFixed(2),
            'up': parseFloat((averageSpeeds[isp].up / averageSpeeds[isp].count) / 1000).toFixed(2),
            'count': averageSpeeds[isp].count,
            'transit': averageSpeeds[isp].transit
        });
    }

    sortableAverage.sort(function(a, b) {
        return a['down'] - b['down'];
    });
    sortableAverage.reverse();

    for(let isp of sortableAverage) {
        averageTableHTML += `
            <tr>
                <td><img src="${ispLogo(isp.name, true, isp.transit)}"> ${isp.name.replace('SSID: ', '').replace(/\"/g, '')} <span class="smol">${parseInt(isp.count)} tests</span></td>
                <td class="mono right">${isp.down}</td>
                <td class="mono right">${isp.up}</td>
            </tr>
        `;
    }
    averageTableHTML += `</tbody>`;
    document.getElementById('js-averages').innerHTML = averageTableHTML;

    s('done, refresh to use a different file');
    // document.getElementById('header').style.display = 'none';
}



function ispLogo(isp, black, transit) {
    let url = 'isps/mast.png';
    // let url = 'isps/mast_white.png';
    // if(black) url = 'isps/mast.png';

    isp = isp.toLowerCase();

    if(isp.includes('o2') || isp.includes('telefonica') || isp.includes('tesco') || isp.includes('sky') || isp.includes('truphone')) url = 'isps/cell/o2_border.png';
    if(isp.includes('voda') || isp.includes('voxi')) url = 'isps/cell/voda_border.png';
    if(isp.includes('ee') || isp.includes('orange') || isp.includes('bt') || isp.includes('zevvle')) url = 'isps/cell/ee_border.png';
    if(isp.includes('three') || isp.includes('3') || isp.includes('smarty')) url = 'isps/cell/3_border.png';

    if(isp.includes('ssid')) {
        if(transit) {
            url = 'isps/train_wifi.png';
        } else {
            url = 'isps/wifi.png';
        }
    };
    
    // if(isp.includes('ssid')) url = 'isps/wifi_white.png';
    // if(isp.includes('ssid') && black) url = 'isps/wifi.png';


    return url;
}

function genIcon(isp, transit) {
    let url = ispLogo(isp, false, transit);

    return L.icon({
        iconUrl: `${url}`,
        iconRetinaUrl: `${url}`,
        iconSize: [24, 24],
        popupAnchor: [0, -5],
    });
}

// https://stackoverflow.com/a/44418732
function getOrdinalNum(n) {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}