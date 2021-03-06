let mapDiv = document.getElementById('yeahyeahyeahs');
let map = L.map('yeahyeahyeahs', {
    center: [52.43, -1.64], // meriden post office
    zoom: 6
});

let iOS = false;
if(navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPod') || navigator.userAgent.includes('iPad')) {
    iOS = true;
    alert('Safari has some issues with map tiles and displaying dates. For a better experience, try using a desktop browser.');
}

let dumbDates = false;
let androidFile = false;

function useCarto() {
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', { attribution: `Tiles by <a href="https://carto.com/">Carto</a>`}).addTo(map);
}

function useCartoVoyager() {
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', { attribution: `Tiles by <a href="https://carto.com/">Carto</a>`}).addTo(map);
}

function useOSM() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors`}).addTo(map);
}

useOSM();