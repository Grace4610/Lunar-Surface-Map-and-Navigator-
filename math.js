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


//Math calculations for finding optimal landing site
//Create a 0-100 score to normalize all factors 
function calculateScore(site, weights) {
  //Slope score: 0 = 100pts, 20+ = 0 pts
  const flatnessScore = Math.max(0, Math.min(100, 100 - (site.slopeDeg * 5)));

  //Sunlight & Earth Comms are already percentages (0-100)
  const sunlightScore = site.sunlightPct;
  const commsScore = site.earthCommsPct;


  //Ice Proximity: 0 km = 100 pts, 500+ km = 0 pts
  const iceScore = Math.max(0, Math.min(100, 100 - (site.iceProximityKm / 5)));


  //Calculate total weight 
  const totalWeight = weights.flatness + weights.sunlight + weights.comms + weights.ice;


  //Don't calculate if all sliders are set to zero
  if (totalWeight === 0) {
    return 0;
  }


  // Weighted average formula
  const weightedSum =
    (flatnessScore * weights.flatness) +
    (sunlightScore * weights.sunlight) +
    (commsScore * weights.comms) +
    (iceScore * weights.ice);


  //Round to 1 decimal place
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}


//Create score for every site, filter out unsafe locations, and sort from best to worst
function rankSites(sites, weights, maxAllowedSlope = 20) {
  return sites
    .filter(site => site.slopeDeg <= maxAllowedSlope)
    .map(site => {
      return {
        ...site,
        score: calculateScore(site, weights)
      };
    })
    .sort((a, b) => b.score - a.score);
}
