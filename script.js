// =========================
// CONFIGURACIÓN DE CENTROS
// =========================
const CENTERS = [
    {
        name: "CAU San Miguel",
        address: "Av. León Gallardo 207, Muñiz, Provincia de Buenos Aires",
        lat: -34.54288,
        lng: -58.71247
    },
    {
        name: "CAU Don Torcuato",
        address: "Av. Ángel T. de Alvear 2555, Don Torcuato, Provincia de Buenos Aires",
        lat: -34.48294,
        lng: -58.64372
    },
    {
        name: "CAU Hurlingham",
        address: "Arturo Jauretche 1435, Hurlingham, Provincia de Buenos Aires",
        lat: -34.58834,
        lng: -58.63996
    },
    {
        name: "CAU Cañuelas",
        address: "C. Libertad 1200, Cañuelas, Provincia de Buenos Aires",
        lat: -35.05373,
        lng: -58.76018
    },
    {
        name: "CAU San Martín",
        address: "Sarmiento 1887, San Martín, Provincia de Buenos Aires",
        lat: -34.57407,
        lng: -58.53918
    },
    {
        name: "CAU Parque Leloir",
        address: "Martín Fierro 3246, Villa Udaondo, Provincia de Buenos Aires",
        lat: -34.63513,
        lng: -58.67041
    },
    {
        name: "CAU Munro",
        address: "Vélez Sársfield 4898, Munro, Provincia de Buenos Aires",
        lat: -34.53209,
        lng: -58.51143
    },
    {
        name: "CAU Merlo",
        address: "Avellaneda 673, Merlo, Provincia de Buenos Aires",
        lat: -34.67049,
        lng: -58.72982
    },
    {
        name: "CAU Banfield",
        address: "Vieytes 211, Banfield, Provincia de Buenos Aires",
        lat: -34.74281,
        lng: -58.39729
    }
];

// =========================
// FUNCIONES DE CÁLCULO
// =========================

// Haversine (distancia en km)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI/180) *
        Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimación de tiempo (más realista que solo km)
function estimateTravelTimeKm(distanceKm) {
    if (distanceKm < 5) return distanceKm / 25 * 60;      // tráfico urbano
    if (distanceKm < 15) return distanceKm / 40 * 60;     // mixto
    return distanceKm / 60 * 60;                          // ruta
}

// =========================
// CACHÉ PERSISTENTE
// =========================

function getCachedLocation(query) {
    const cache = JSON.parse(localStorage.getItem("locationCache") || "{}");
    return cache[query];
}

function saveLocationToCache(query, data) {
    const cache = JSON.parse(localStorage.getItem("locationCache") || "{}");
    cache[query] = data;
    localStorage.setItem("locationCache", JSON.stringify(cache));
}

// =========================
// GEOCODING SIN API KEY
// =========================

async function geocodeFree(text) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`;

    const res = await fetch(url, {
        headers: { "User-Agent": "Siglo21-Distance-App" }
    });

    const data = await res.json();
    if (!data.length) return null;

    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
}

// =========================
// MAPA ESTÁTICO (OSM)
// =========================

function generateStaticMap(userLat, userLng, centerLat, centerLng) {
    return `
        https://staticmap.openstreetmap.de/staticmap.php?
        center=${userLat},${userLng}
        &zoom=11
        &size=600x400
        &markers=${userLat},${userLng},lightblue1
        &markers=${centerLat},${centerLng},red-pushpin
    `.replace(/\s+/g, "");
}

// =========================
// PROCESAR BUSQUEDA
// =========================

document.getElementById("search").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("searchBtn").click();
});

document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("search").value.trim();
    if (!query) return;

    document.getElementById("result").innerHTML = "Buscando ubicación...";

    let userLoc = getCachedLocation(query);

    if (!userLoc) {
        userLoc = await geocodeFree(query);
        if (!userLoc) {
            document.getElementById("result").innerHTML = "No se encontró la localidad.";
            return;
        }
        saveLocationToCache(query, userLoc);
    }

    const distances = CENTERS.map(center => {
        const km = haversine(userLoc.lat, userLoc.lng, center.lat, center.lng);
        const time = estimateTravelTimeKm(km);

        return {
            ...center,
            distance: km,
            time: time
        };
    }).sort((a, b) => a.time - b.time);

    const first = distances[0];
    const second = distances[1];

    document.getElementById("result").innerHTML = `
        <h3>Centro más cercano (por tiempo estimado):</h3>
        <b>${first.name}</b><br>
        Dirección: ${first.address}<br>
        Distancia: ${first.distance.toFixed(2)} km<br>
        Tiempo estimado: ${first.time.toFixed(0)} min<br><br>
        <img src="${generateStaticMap(userLoc.lat, userLoc.lng, first.lat, first.lng)}"><br><br>

        <h3>Segundo centro más cercano:</h3>
        <b>${second.name}</b><br>
        Dirección: ${second.address}<br>
        Distancia: ${second.distance.toFixed(2)} km<br>
        Tiempo estimado: ${second.time.toFixed(0)} min<br><br>
        <img src="${generateStaticMap(userLoc.lat, userLoc.lng, second.lat, second.lng)}">
    `;
});
