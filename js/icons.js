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