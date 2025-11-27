const data = [
    { provincia: "Buenos Aires", ciudad: "La Plata", nombre: "Centro La Plata" },
    { provincia: "Buenos Aires", ciudad: "Mar del Plata", nombre: "Centro Mar del Plata" },
    { provincia: "Córdoba", ciudad: "Córdoba Capital", nombre: "Centro Córdoba" },
    { provincia: "Santa Fe", ciudad: "Rosario", nombre: "Centro Rosario" },
];

const input = document.getElementById("searchInput");
const results = document.getElementById("results");

input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    results.innerHTML = "";

    const filtered = data.filter(c =>
        c.provincia.toLowerCase().includes(query) ||
        c.ciudad.toLowerCase().includes(query) ||
        c.nombre.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        results.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    filtered.forEach(c => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.innerHTML = `
            <h3>${c.nombre}</h3>
            <p><strong>Provincia:</strong> ${c.provincia}</p>
            <p><strong>Ciudad:</strong> ${c.ciudad}</p>
        `;
        results.appendChild(div);
    });
});
