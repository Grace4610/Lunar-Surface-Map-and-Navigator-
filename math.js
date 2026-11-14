//code actual math and logic behind app

//zoomable moon map 
const map = L.map('moon-map', {
crs: L.CRS.EPSG4326,
center: [0, 0],
zoom: 1,
minZoom: 0.5,
maxZoom: 7
});

// NASA moon trek global surface titles
L.titleLayer('https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default028mm/{z}/{y}/{x}.jpg', {
    attribution: 'NASA / GSFC / ASU (Moon Trek)',
    noWrap: true
}).addTo(map);

//linking json sites data
fetch('sites.json')
  .then(response => response.json())
  .then(sites => {
    sites.forEach(site => {
      L.marker([site.lat, site.lon])
        .addTo(map)
        .bindPopup(`
          <b>${site.name}</b><br>
          Category: ${site.category}<br>
          Slope: ${site.slopeDeg}° | Sunlight: ${site.sunlightPct}%<br>
          Earth Comms: ${site.earthCommsPct}% | Ice Dist: ${site.iceProximityKm} km<br>
          <i>${site.notes}</i>
        `);
    });
  });