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
                <th>Avg Ltcy</th>
            </tr>
        </thead>
        <tbody>
    `;

    if(androidFile) {
        alert('Android-generated files don\'t work very well, sorry. Ironically they contain less information than those exported on iOS.');
    }

    if(dumbDates) {
        alert('Your date format is bad, some things might be a bit broken since I don\'t care to fix the problems it causes.');
    }

    let i = -1;
	//let j = 0;
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

        if(androidFile) {
            date = `${cols[0]} ${cols[1]}`; // why the fuck does it put a comma in this
            type = cols[2];
            isp = 'Android'; // android exports do not include this for some reason
            lat = cols[3];
            lon = cols[4];
            downSpeed = cols[5]*1000;
            downUsed = cols[6];
            upSpeed = cols[7]*1000;
            upUsed = cols[8];
            ping = cols[9];
            serverLoc = cols[10];
            intIP = cols[11];
            extIP = cols[12];
        }
	
		//console.log(`${extIP} ${lat} ${lon}`);
        if(!lat || !lon) continue;

        let transit = false;
        if(isp.toLowerCase().includes('ssid') || isp.toLowerCase().includes('Wifi')) {
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
		
		if(date.includes('/')) {
			let dateBefore = date;
            if(!dumbDates) {
			    date = date.replace(/\//g, '');
			          // YEAR                                                              // MONTH                           // DAY                             // TIME
			    date = `${date.charAt(4)}${date.charAt(5)}${date.charAt(6)}${date.charAt(7)}-${date.charAt(2)}${date.charAt(3)}-${date.charAt(0)}${date.charAt(1)} ${date.substr(9)}`;
            }
            // console.log(`${dateBefore} --> ${date}`);
		}
		
        // ios safari is a sped
        let dateStr = date;
        if(!dumbDates) {
            if(!iOS) {
                let dateObj = new Date(date);
                dateStr = `${getOrdinalNum(dateObj.getDate())} ${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()} ${dateObj.getHours()}:` + (`0${dateObj.getMinutes()}`).slice(-2);
            }
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
		
		//j++;
		//console.log(`gone thru ${i}, added ${j}`);

        isp = isp.replace(/\"/g, '').replace(/(Unknown|LTE|WCDMA|HSDPA|GSM|EDGE)/g, '');        

        if(isp.length > 1) {
            // if(isp === 'Sky') isp = 'O2';

            if(averageSpeeds[isp]) {
                averageSpeeds[isp]['down'] += parseFloat(downSpeed);
                averageSpeeds[isp]['up'] += parseFloat(upSpeed);
                averageSpeeds[isp]['ping'] += parseInt(ping);
                averageSpeeds[isp]['count']++;
            } else {
                averageSpeeds[isp] = {};
                averageSpeeds[isp]['down'] = parseFloat(downSpeed);
                averageSpeeds[isp]['up'] = parseFloat(upSpeed);
                averageSpeeds[isp]['ping'] = parseInt(ping);
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
            'ping': parseInt((averageSpeeds[isp].ping / averageSpeeds[isp].count)).toFixed(0),
            'count': averageSpeeds[isp].count,
            'transit': averageSpeeds[isp].transit
        });
    }

    sortableAverage.sort(function(a, b) {
        return a['down'] - b['down'];
    });
    sortableAverage.reverse();

    for(let isp of sortableAverage) {
        iconStyle = 'app';
        averageTableHTML += `
            <tr>
                <td><img src="${ispLogo(isp.name, true, isp.transit)}"> ${isp.name.replace('SSID: ', '').replace(/\"/g, '')} <span class="smol">${parseInt(isp.count)} tests</span></td>
                <td class="mono right">${isp.down}</td>
                <td class="mono right">${isp.up}</td>
                <td class="mono right">${isp.ping}ms</td>
            </tr>
        `;
        iconStyle = 'border';
    }
    averageTableHTML += `</tbody>`;
    document.getElementById('js-averages').innerHTML = averageTableHTML;

    s('done, refresh to use a different file');
    // document.getElementById('header').style.display = 'none';
}

// https://stackoverflow.com/a/44418732
function getOrdinalNum(n) {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}